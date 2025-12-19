
import React, { useState } from 'react';
import { CalculatedStock, Owner, Transaction } from '../types';
import { XIcon, PencilIcon, TrashIcon, ArrowTopRightOnSquareIcon, UserGroupIcon, SparklesIcon } from './icons';
import { syncPriceViaWeb } from '../services/marketService';

interface StockDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockData: CalculatedStock | null;
  formatCurrency: (value: number) => string;
  onDeleteTransaction: (transactionId: string | number) => void;
  onEditTransaction: (transaction: Transaction) => void;
  owners: Owner[];
  onBulkReassignOwner: (stockId: string, newOwner: Owner) => void;
  onUpdatePrice: (stockId: string, newPrice: number) => void;
}

const StockDetailsModal: React.FC<StockDetailsModalProps> = ({ 
    isOpen, 
    onClose, 
    stockData, 
    formatCurrency, 
    onDeleteTransaction, 
    onEditTransaction, 
    owners, 
    onBulkReassignOwner,
    onUpdatePrice
}) => {
  const [manualPrice, setManualPrice] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [sources, setSources] = useState<any[]>([]);

  if (!isOpen || !stockData) return null;

  const transactions = [...stockData.transactions].sort((a,b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());

  const handlePriceUpdate = () => {
    const p = parseFloat(manualPrice);
    if (!isNaN(p) && p >= 0) {
      onUpdatePrice(stockData.stock.id, p);
      setManualPrice('');
    }
  };

  const handleLiveSync = async () => {
    if (!window.confirm("Perform Web Search? This uses Gemini Search Grounding which is a paid premium feature.")) return;
    
    setIsSyncing(true);
    const result = await syncPriceViaWeb(stockData.stock.id);
    if (result.price > 0) {
      onUpdatePrice(stockData.stock.id, result.price);
      setSources(result.sources);
    } else {
      alert("Could not retrieve live price. Please try manual entry.");
    }
    setIsSyncing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-200">
        <header className="px-10 py-8 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-5">
            <div className="bg-indigo-600 text-white p-3.5 rounded-2xl shadow-lg shadow-indigo-100">
              <ArrowTopRightOnSquareIcon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{stockData.stock.companyName}</h2>
              <p className="text-sm font-bold text-indigo-600 uppercase tracking-[0.2em] mt-0.5">{stockData.stock.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all border border-gray-100">
            <XIcon className="w-7 h-7" />
          </button>
        </header>

        <div className="p-10 overflow-y-auto flex-grow bg-white custom-scrollbar">
          {/* Price & Analysis Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            <div className="lg:col-span-5 p-8 bg-indigo-900 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                    <SparklesIcon className="w-32 h-32" />
                </div>
                
                <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] mb-3">Live Market Price (INR)</p>
                <div className="flex items-baseline space-x-4 mb-8">
                    <p className="text-5xl font-medium tracking-tighter">{formatCurrency(stockData.stock.currentPrice)}</p>
                    {isSyncing && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                </div>
                
                <div className="space-y-4 relative z-10">
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={manualPrice}
                      onChange={(e) => setManualPrice(e.target.value)}
                      placeholder="Enter price manually..."
                      className="flex-grow bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    />
                    <button 
                      onClick={handlePriceUpdate}
                      className="bg-white text-indigo-900 text-xs font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-all shadow-lg"
                    >
                      SAVE
                    </button>
                  </div>
                  
                  <div className="pt-4 border-t border-white/10">
                    <button 
                      onClick={handleLiveSync}
                      disabled={isSyncing}
                      className="w-full flex items-center justify-center space-x-2 py-3 bg-amber-500 hover:bg-amber-400 text-amber-950 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg disabled:opacity-50"
                    >
                      <SparklesIcon className="w-4 h-4" />
                      <span>{isSyncing ? 'Searching Web...' : 'Sync via Web (Paid Action)'}</span>
                    </button>
                    <p className="text-[9px] mt-2 opacity-50 italic text-center">Web search grounding may incur Gemini API charges.</p>
                  </div>
                </div>

                {sources.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-bottom-2">
                        <p className="text-[9px] font-bold uppercase opacity-40 mb-3 tracking-widest">Verify Results:</p>
                        <div className="flex flex-wrap gap-2">
                            {sources.map((s, i) => s.web && (
                                <a key={i} href={s.web.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] bg-white/5 border border-white/10 px-2 py-1 rounded hover:bg-white/10 truncate max-w-[120px]">
                                    {s.web.title}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="lg:col-span-7 grid grid-cols-2 gap-6">
                <div className="p-8 bg-gray-50 border border-gray-100 rounded-[2rem] flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Total Team Cost</p>
                    <p className="text-3xl font-medium text-gray-900">{formatCurrency(stockData.investment)}</p>
                </div>
                <div className={`p-8 border rounded-[2rem] flex flex-col justify-center ${stockData.pAndL >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${stockData.pAndL >= 0 ? 'text-green-600' : 'text-red-600'}`}>Current P&L</p>
                    <p className={`text-3xl font-medium ${stockData.pAndL >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                        {stockData.pAndL >= 0 ? '+' : ''}{formatCurrency(stockData.pAndL)}
                    </p>
                </div>
                <div className="p-8 bg-gray-50 border border-gray-100 rounded-[2rem] flex flex-col justify-center col-span-2">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Ownership Provenance</p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-indigo-600">
                          <UserGroupIcon className="w-5 h-5" />
                          <span className="text-sm font-bold uppercase tracking-tight">Active: {stockData.transactions[0]?.owner}</span>
                        </div>
                        <select 
                            onChange={(e) => onBulkReassignOwner(stockData.stock.id, e.target.value)}
                            className="bg-white border border-gray-200 text-[10px] font-bold uppercase px-4 py-2 rounded-xl focus:outline-none shadow-sm"
                        >
                            <option value="">REASSIGN ASSET...</option>
                            {owners.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                </div>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Transaction Audit Ledger</h3>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{transactions.length} Records</span>
          </div>
          
          <div className="overflow-hidden border border-gray-100 rounded-[2rem] bg-white shadow-sm overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Type</th>
                  <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Owner</th>
                  <th className="px-8 py-5 text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest">Qty</th>
                  <th className="px-8 py-5 text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest">Price</th>
                  <th className="px-8 py-5 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">Edit/Del</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-8 py-6 text-sm font-semibold text-gray-900">{new Date(t.transactionDate).toLocaleDateString('en-GB')}</td>
                    <td className={`px-8 py-6 text-sm font-bold ${t.action === 'Buy' ? 'text-green-600' : 'text-red-600'}`}>{t.action}</td>
                    <td className="px-8 py-6"><span className="px-3 py-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-lg uppercase tracking-widest">{t.owner}</span></td>
                    <td className="px-8 py-6 text-right text-sm font-medium text-gray-900">{t.quantity.toLocaleString()}</td>
                    <td className="px-8 py-6 text-right text-sm font-medium text-gray-900">{formatCurrency(t.transactionPrice)}</td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center space-x-4 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => onEditTransaction(t)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                          <button onClick={() => onDeleteTransaction(t.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetailsModal;
