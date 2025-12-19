
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';

import {
  Transaction,
  Stock,
  CalculatedStock,
  TransactionAction,
  PortfolioSummary,
  Owner,
} from './types';
import { fetchStockPrices, updateStoredPrice } from './services/marketService';
import { supabase } from './supabaseClient';

// Import components
import StockDetailsModal from './components/StockDetailsModal';
import AddTransactionModal from './components/AddTransactionModal';
import ManageOwnersModal from './components/ManageOwnersModal';
import { Auth } from './components/Auth';
// FIX: Imported missing SparklesIcon from icons components to fix compilation error.
import { SparklesIcon } from './components/icons';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stocks, setStocks] = useState<{ [key: string]: Stock }>({});
  const [lastPriceUpdate, setLastPriceUpdate] = useState<number>(0);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [currency, setCurrency] = useState('INR');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('All Owners');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isManageOwnersModalOpen, setManageOwnersModalOpen] = useState(false);
  
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadData = useCallback(async () => {
    if (!session) return;
    setIsLoadingData(true);
    try {
      const { data: ownerData } = await supabase.from('owners').select('name');
      if (ownerData) setOwners(ownerData.map(o => o.name));

      const { data, error } = await supabase
        .from('stock_transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      if (data) {
        const mapped = data.map((db: any) => ({
          id: db.id,
          stockId: (db.stock_symbol || '').toUpperCase().trim(),
          companyName: db.company_name || db.stock_symbol || 'Unknown',
          ISINCode: db.isin_code || '',
          owner: db.owner || 'Unknown',
          action: db.action?.toLowerCase().includes('sell') ? TransactionAction.Sell : TransactionAction.Buy,
          quantity: Math.abs(Number(db.quantity)) || 0,
          transactionPrice: Number(db.transaction_price) || 0,
          brokerage: Number(db.brokerage) || 0,
          stampDuty: Number(db.stamp_duty) || 0,
          transactionCharges: Number(db.transaction_charges) || 0,
          exchange: db.exchange || '',
          broker: db.broker || '',
          transactionDate: db.transaction_date || '',
          userEmail: db.user_email,
        }));
        setTransactions(mapped);
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, [session]);

  useEffect(() => { loadData(); }, [loadData]);

  const refreshPrices = useCallback(async () => {
    const stockIds: string[] = Array.from(new Set<string>(transactions.map(t => t.stockId)));
    if (stockIds.length > 0) {
      const { prices, lastUpdated } = await fetchStockPrices(stockIds);
      setStocks(prevStocks => {
        const updated = { ...prevStocks };
        stockIds.forEach(id => {
          updated[id] = {
            id,
            companyName: transactions.find(t => t.stockId === id)?.companyName || 'Unknown',
            currentPrice: prices[id] || 0
          };
        });
        return updated;
      });
      setLastPriceUpdate(lastUpdated);
    }
  }, [transactions]);

  useEffect(() => { refreshPrices(); }, [transactions]);
  
  const handleUpdatePrice = (stockId: string, newPrice: number) => {
    updateStoredPrice(stockId, newPrice);
    refreshPrices();
  };

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
  }, [currency]);

  const calculatedStocks = useMemo<CalculatedStock[]>(() => {
    const stockGroups = transactions.filter(t => {
      const isOwnerMatch = selectedOwner === 'All Owners' || t.owner === selectedOwner;
      const isStartDateMatch = !startDate || new Date(t.transactionDate) >= new Date(startDate);
      const isEndDateMatch = !endDate || new Date(t.transactionDate) <= new Date(endDate);
      return isOwnerMatch && isStartDateMatch && isEndDateMatch;
    }).reduce((acc, t) => {
      acc[t.stockId] = [...(acc[t.stockId] || []), t];
      return acc;
    }, {} as { [key: string]: Transaction[] });

    const list = Object.keys(stockGroups).map(stockId => {
      const stockInfo = stocks[stockId] || { id: stockId, companyName: stockGroups[stockId][0]?.companyName, currentPrice: 0 };
      const allTxs = stockGroups[stockId].sort((a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime());

      let quantity = 0;
      let costBasis = 0;
      allTxs.forEach(t => {
        const totalCharges = t.brokerage + t.stampDuty + t.transactionCharges;
        if (t.action === TransactionAction.Buy) {
          costBasis += (t.quantity * t.transactionPrice) + totalCharges;
          quantity += t.quantity;
        } else {
          const avg = quantity > 0 ? costBasis / quantity : 0;
          costBasis -= avg * t.quantity;
          quantity -= t.quantity;
        }
      });
      
      const currentValue = quantity * stockInfo.currentPrice;
      const pAndL = currentValue - costBasis;
      
      return {
        stock: stockInfo,
        transactions: allTxs,
        quantity,
        investment: quantity > 0 ? costBasis : 0,
        currentValue,
        pAndL: quantity > 0 ? pAndL : 0,
        avgAnnualReturn: 0, 
        firstTransactionDate: allTxs[0]?.transactionDate || '',
        recommendation: { text: 'Hold' as const, style: 'bg-gray-100 text-gray-800' }
      };
    }).filter(s => s.quantity > 0.0001);

    if (!searchQuery) return list;
    return list.filter(s => s.stock.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || s.stock.id.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [transactions, stocks, searchQuery, selectedOwner, startDate, endDate]);

  const portfolioSummary = useMemo<PortfolioSummary>(() => {
    return calculatedStocks.reduce((acc, stock) => {
      acc.totalInvestment += stock.investment;
      acc.currentValue += stock.currentValue;
      acc.totalPandL += stock.pAndL;
      return acc;
    }, { totalInvestment: 0, currentValue: 0, totalPandL: 0, avgAnnualReturn: 0 });
  }, [calculatedStocks]);

  const handleSaveTransaction = async (data: Omit<Transaction, 'id'>, id?: string | number) => {
    setIsSyncing(true);
    try {
      const dbRow = {
        stock_symbol: data.stockId,
        company_name: data.companyName,
        isin_code: data.ISINCode,
        owner: data.owner,
        action: data.action.trim(),
        quantity: data.quantity,
        transaction_price: data.transactionPrice,
        brokerage: data.brokerage,
        stamp_duty: data.stamp_duty,
        transaction_charges: data.transaction_charges,
        exchange: data.exchange,
        broker: data.broker,
        transaction_date: data.transactionDate,
        user_email: session?.user?.email, 
      };
      const { error } = await supabase.from('stock_transactions').upsert(id ? { ...dbRow, id } : dbRow);
      if (error) throw error;
      loadData();
    } catch (err: any) {
      alert(`Sync Error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBulkReassignOwner = async (stockId: string, newOwner: Owner) => {
    if (!window.confirm(`Reassign all ${stockId} to ${newOwner}?`)) return;
    setIsSyncing(true);
    try {
      const { error } = await supabase.from('stock_transactions').update({ owner: newOwner }).eq('stock_symbol', stockId);
      if (error) throw error;
      loadData();
    } catch (err: any) { alert(err.message); } finally { setIsSyncing(false); }
  };

  if (!session) return <Auth />;
  if (isLoadingData) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
      <div className="w-[90vw] mx-auto px-4 py-6">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Whizrock <span className="text-indigo-600">Ledger</span></h1>
            <div className="flex items-center space-x-3 mt-2">
               <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Shared Asset Management</p>
               <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
               <p className="text-xs text-indigo-500 font-bold uppercase tracking-tighter">Cost-Control Mode Active</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => supabase.auth.signOut()} className="text-xs font-bold text-red-600 px-6 py-3 border border-red-50 rounded-2xl hover:bg-red-50 transition-all uppercase tracking-widest">SIGN OUT</button>
            <div className="bg-green-50 px-6 py-3 rounded-2xl border border-green-100 flex items-center space-x-3 shadow-sm shadow-green-100">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-lg shadow-green-200"></div>
              <span className="text-[10px] font-bold text-green-700 uppercase tracking-[0.2em]">SECURE & PAID-ONLY SYNC</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <main className="lg:col-span-3 space-y-10">
            <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="p-8 bg-gray-50/50 rounded-3xl border border-gray-100">
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Portfolio Cost</h3>
                      <p className="text-3xl font-medium text-gray-900">{formatCurrency(portfolioSummary.totalInvestment)}</p>
                  </div>
                  <div className="p-8 bg-gray-50/50 rounded-3xl border border-gray-100">
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Current Value</h3>
                      <p className="text-3xl font-medium text-gray-900">{formatCurrency(portfolioSummary.currentValue)}</p>
                  </div>
                  <div className={`p-8 rounded-3xl border shadow-lg shadow-gray-100 ${portfolioSummary.totalPandL >= 0 ? 'bg-green-50 border-green-100 shadow-green-50' : 'bg-red-50 border-red-100 shadow-red-50'}`}>
                      <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 ${portfolioSummary.totalPandL >= 0 ? 'text-green-600' : 'text-red-500'}`}>Cumulative P&L</h3>
                      <p className={`text-3xl font-medium ${portfolioSummary.totalPandL >= 0 ? 'text-green-800' : 'text-red-800'}`}>{formatCurrency(portfolioSummary.totalPandL)}</p>
                  </div>
              </div>
            </section>
            
            <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-10 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest">Team Assets</h2>
                  <div className="flex items-center space-x-4">
                      <select value={currency} onChange={e => setCurrency(e.target.value)} className="text-[10px] font-bold bg-white border border-gray-200 rounded-xl px-4 py-2.5 cursor-pointer shadow-sm uppercase tracking-widest">
                          <option value="INR">INR</option><option value="USD">USD</option>
                      </select>
                      <button onClick={() => setAddModalOpen(true)} className="bg-indigo-600 text-white text-[10px] font-bold px-8 py-3 rounded-2xl hover:bg-indigo-700 transition-all uppercase tracking-widest shadow-xl shadow-indigo-100">ADD ENTRY</button>
                  </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/20">
                        <tr>
                          <th className="px-10 py-6 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Asset Details</th>
                          <th className="px-10 py-6 text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest">Holding Qty</th>
                          <th className="px-10 py-6 text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Cost</th>
                          <th className="px-10 py-6 text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest">Current Price</th>
                          <th className="px-10 py-6 text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest">Net P&L</th>
                          <th className="px-10 py-6 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">Audit</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                       {calculatedStocks.map(s => (
                           <tr key={s.stock.id} className="hover:bg-indigo-50/10 transition-colors">
                                <td className="px-10 py-8"><div className="font-bold text-gray-900 text-base">{s.stock.companyName}</div><div className="text-[10px] font-bold text-indigo-500 tracking-widest">{s.stock.id}</div></td>
                                <td className="px-10 py-8 text-right text-sm font-semibold text-gray-700">{s.quantity.toLocaleString()}</td>
                                <td className="px-10 py-8 text-right text-sm font-semibold text-gray-700">{formatCurrency(s.investment)}</td>
                                <td className={`px-10 py-8 text-right text-sm font-bold ${s.stock.currentPrice === 0 ? 'text-amber-500' : 'text-indigo-600'}`}>
                                  {s.stock.currentPrice === 0 ? 'NOT SET' : formatCurrency(s.stock.currentPrice)}
                                </td>
                                <td className={`px-10 py-8 text-right text-sm font-bold ${s.pAndL >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(s.pAndL)}</td>
                                <td className="px-10 py-8 text-center"><button onClick={() => { setSelectedStockId(s.stock.id); setDetailsModalOpen(true); }} className="text-[10px] font-bold text-indigo-600 uppercase border-b-2 border-indigo-100 hover:border-indigo-600 transition-all pb-0.5">MANAGE</button></td>
                           </tr>
                       ))}
                    </tbody>
                </table>
              </div>
            </section>
          </main>

          <aside className="space-y-10">
            <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Filter Tools</h3>
                <div className="space-y-5">
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="SEARCH SYMBOLS..." className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-100 transition-all outline-none" />
                    <select value={selectedOwner} onChange={e => setSelectedOwner(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold cursor-pointer outline-none">
                        <option>All Owners</option>
                        {owners.map(o => <option key={o}>{o}</option>)}
                    </select>
                </div>
            </section>
            
            <div className="bg-indigo-900 p-10 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <SparklesIcon className="w-20 h-20" />
              </div>
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4">Billing Safety</h3>
              <p className="text-xs leading-relaxed text-indigo-100 font-medium">
                Automatic background price fetching has been disabled. You now have full control over when the app uses paid search tools. 
                <br/><br/>
                Check individual asset pages for manual and web-search sync options.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <StockDetailsModal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setDetailsModalOpen(false)} 
        stockData={calculatedStocks.find(s => s.stock.id === selectedStockId) || null} 
        formatCurrency={formatCurrency}
        onDeleteTransaction={(id) => { supabase.from('stock_transactions').delete().eq('id', id).then(() => loadData()); setDetailsModalOpen(false); }}
        onEditTransaction={(t) => { setTransactionToEdit(t); setDetailsModalOpen(false); setAddModalOpen(true); }}
        owners={owners}
        onBulkReassignOwner={handleBulkReassignOwner}
        onUpdatePrice={handleUpdatePrice}
      />
      
      <AddTransactionModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onSave={handleSaveTransaction} transactionToEdit={transactionToEdit} owners={owners} />
      <ManageOwnersModal isOpen={isManageOwnersModalOpen} onClose={() => setManageOwnersModalOpen(false)} owners={owners} setOwners={setOwners} transactions={transactions} setTransactions={setTransactions} />
    </div>
  );
};

export default App;
