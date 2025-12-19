import React, { useState, useEffect } from 'react';
import { Transaction, Owner, TransactionAction } from '../types';
import { XIcon } from './icons';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>, id?: string) => void;
  transactionToEdit?: Transaction | null;
  owners: Owner[];
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onSave, transactionToEdit, owners }) => {
  const [stockId, setStockId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [ISINCode, setISINCode] = useState('');
  const [owner, setOwner] = useState<Owner>(owners[0] || '');
  const [action, setAction] = useState<TransactionAction>(TransactionAction.Buy);
  const [quantity, setQuantity] = useState('');
  const [transactionPrice, setTransactionPrice] = useState('');
  const [brokerage, setBrokerage] = useState('');
  const [stampDuty, setStampDuty] = useState('');
  const [transactionCharges, setTransactionCharges] = useState('');
  const [exchange, setExchange] = useState('');
  const [broker, setBroker] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const isEditMode = !!transactionToEdit;
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && transactionToEdit) {
        setStockId(transactionToEdit.stockId);
        setCompanyName(transactionToEdit.companyName);
        setISINCode(transactionToEdit.ISINCode);
        setOwner(transactionToEdit.owner);
        setAction(transactionToEdit.action);
        setQuantity(transactionToEdit.quantity.toString());
        setTransactionPrice(transactionToEdit.transactionPrice.toString());
        setBrokerage(transactionToEdit.brokerage.toString());
        setStampDuty(transactionToEdit.stampDuty.toString());
        setTransactionCharges(transactionToEdit.transactionCharges.toString());
        setExchange(transactionToEdit.exchange);
        setBroker(transactionToEdit.broker);
        setTransactionDate(new Date(transactionToEdit.transactionDate).toISOString().split('T')[0]);
      } else {
        resetForm();
      }
      setError('');
    }
  }, [isOpen, isEditMode, transactionToEdit, owners]);
  
  if (!isOpen) {
    return null;
  }

  const resetForm = () => {
    setStockId('');
    setCompanyName('');
    setISINCode('');
    setOwner(owners[0] || '');
    setAction(TransactionAction.Buy);
    setQuantity('');
    setTransactionPrice('');
    setBrokerage('0');
    setStampDuty('0');
    setTransactionCharges('0');
    setExchange('');
    setBroker('');
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!stockId || !companyName || !quantity || !transactionPrice || !transactionDate || !ISINCode || !broker || !exchange) {
      setError('Please fill out all required fields.');
      return;
    }
    
    const numQuantity = parseFloat(quantity);
    const numPrice = parseFloat(transactionPrice);
    const numBrokerage = parseFloat(brokerage);
    const numStampDuty = parseFloat(stampDuty);
    const numCharges = parseFloat(transactionCharges);

    if(isNaN(numQuantity) || isNaN(numPrice) || isNaN(numBrokerage) || isNaN(numStampDuty) || isNaN(numCharges) || numQuantity <= 0 || numPrice < 0 || numBrokerage < 0 || numStampDuty < 0 || numCharges < 0) {
      setError('Quantity must be positive. Price and charges cannot be negative.');
      return;
    }

    const transactionData = {
      stockId: stockId.toUpperCase(),
      companyName,
      ISINCode,
      owner,
      action,
      quantity: numQuantity,
      transactionPrice: numPrice,
      brokerage: numBrokerage,
      stampDuty: numStampDuty,
      transactionCharges: numCharges,
      exchange,
      broker,
      transactionDate: new Date(transactionDate).toISOString(),
    };

    onSave(transactionData, isEditMode ? transactionToEdit.id : undefined);
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-10 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">{isEditMode ? 'Edit Transaction' : 'Add New Transaction'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="stockId" className="block text-sm font-medium text-gray-700">Stock Symbol*</label>
              <input type="text" id="stockId" value={stockId} onChange={(e) => setStockId(e.target.value)} className={inputClass} placeholder="e.g., AAPL" required />
            </div>
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name*</label>
              <input type="text" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} placeholder="e.g., Apple Inc." required />
            </div>
          </div>
          
           <div>
              <label htmlFor="ISINCode" className="block text-sm font-medium text-gray-700">ISIN Code*</label>
              <input type="text" id="ISINCode" value={ISINCode} onChange={(e) => setISINCode(e.target.value)} className={inputClass} placeholder="e.g., US0378331005" required />
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="owner" className="block text-sm font-medium text-gray-700">Owner*</label>
              <select id="owner" value={owner} onChange={(e) => setOwner(e.target.value as Owner)} className={inputClass}>
                {owners.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="action" className="block text-sm font-medium text-gray-700">Action*</label>
              <select id="action" value={action} onChange={(e) => setAction(e.target.value as TransactionAction)} className={inputClass}>
                {Object.values(TransactionAction).map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity*</label>
              <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputClass} placeholder="0" required min="0.0001" step="any" />
            </div>
            <div>
              <label htmlFor="transactionPrice" className="block text-sm font-medium text-gray-700">Transaction Price/Share*</label>
              <input type="number" id="transactionPrice" value={transactionPrice} onChange={(e) => setTransactionPrice(e.target.value)} className={inputClass} placeholder="0.00" required min="0" step="any" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label htmlFor="brokerage" className="block text-sm font-medium text-gray-700">Brokerage</label>
                <input type="number" id="brokerage" value={brokerage} onChange={(e) => setBrokerage(e.target.value)} className={inputClass} placeholder="0.00" min="0" step="any" />
            </div>
            <div>
                <label htmlFor="stampDuty" className="block text-sm font-medium text-gray-700">Stamp Duty</label>
                <input type="number" id="stampDuty" value={stampDuty} onChange={(e) => setStampDuty(e.target.value)} className={inputClass} placeholder="0.00" min="0" step="any" />
            </div>
            <div>
              <label htmlFor="transactionCharges" className="block text-sm font-medium text-gray-700">Transaction Charges</label>
              <input type="number" id="transactionCharges" value={transactionCharges} onChange={(e) => setTransactionCharges(e.target.value)} className={inputClass} placeholder="0.00" min="0" step="any" />
            </div>
          </div>
          
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
              <label htmlFor="broker" className="block text-sm font-medium text-gray-700">Broker*</label>
              <input type="text" id="broker" value={broker} onChange={(e) => setBroker(e.target.value)} className={inputClass} required />
            </div>
             <div>
              <label htmlFor="exchange" className="block text-sm font-medium text-gray-700">Exchange*</label>
              <input type="text" id="exchange" value={exchange} onChange={(e) => setExchange(e.target.value)} className={inputClass} placeholder="e.g., NASDAQ" required />
            </div>
             <div>
              <label htmlFor="transactionDate" className="block text-sm font-medium text-gray-700">Date*</label>
              <input type="date" id="transactionDate" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} className={inputClass} required max={today} />
            </div>
          </div>
          
          <footer className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              {isEditMode ? 'Save Changes' : 'Save Transaction'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
