import React from 'react';
import { Transaction, Owner } from '../types';
import { XIcon } from './icons';

interface AllTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  formatCurrency: (value: number) => string;
  owners: Owner[];
}

const getOwnerColor = (owner: Owner, owners: Owner[]) => {
    const colors = ['bg-blue-100 text-blue-800', 'bg-pink-100 text-pink-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800', 'bg-yellow-100 text-yellow-800', 'bg-indigo-100 text-indigo-800'];
    const index = owners.indexOf(owner);
    return colors[index % colors.length] || 'bg-gray-100 text-gray-800';
};

const AllTransactionsModal: React.FC<AllTransactionsModalProps> = ({ isOpen, onClose, transactions, formatCurrency, owners }) => {
  if (!isOpen) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Collective Transaction Ledger</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6 overflow-y-auto">
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Share</th>
                  <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recorded By</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedTransactions.map(t => (
                  <tr key={t.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDate(t.transactionDate)}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <div className="font-medium text-gray-900">{t.companyName}</div>
                        <div className="text-xs text-gray-500">{t.stockId}</div>
                    </td>
                    <td className={`px-4 py-2 whitespace-nowrap text-sm font-semibold ${t.action === 'Buy' ? 'text-green-600' : 'text-orange-600'}`}>{t.action}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getOwnerColor(t.owner, owners)}`}>
                        {t.owner}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right">{t.quantity.toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right">{formatCurrency(t.transactionPrice)}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right">{formatCurrency(t.transactionPrice * t.quantity)}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-400 font-mono">{t.userEmail || 'System'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sortedTransactions.length === 0 && (
                <div className="text-center p-8 text-gray-500">No transactions found in the ledger.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllTransactionsModal;
