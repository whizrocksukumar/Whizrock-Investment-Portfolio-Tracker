import React, { useState } from 'react';
import { Owner, Transaction } from '../types';
import { XIcon, PlusIcon, PencilIcon, TrashIcon } from './icons';

interface ManageOwnersModalProps {
  isOpen: boolean;
  onClose: () => void;
  owners: Owner[];
  setOwners: React.Dispatch<React.SetStateAction<Owner[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const ManageOwnersModal: React.FC<ManageOwnersModalProps> = ({ isOpen, onClose, owners, setOwners, transactions, setTransactions }) => {
  const [newOwner, setNewOwner] = useState('');
  const [editingOwner, setEditingOwner] = useState<{ oldName: string; newName: string } | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleAddOwner = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newOwner.trim();
    if (!trimmedName) {
      setError('Owner name cannot be empty.');
      return;
    }
    if (owners.some(o => o.toLowerCase() === trimmedName.toLowerCase())) {
      setError('This owner name already exists.');
      return;
    }
    setOwners(prevOwners => [...prevOwners, trimmedName]);
    setNewOwner('');
    setError('');
  };

  const handleDeleteOwner = (ownerToDelete: Owner) => {
    const isOwnerInUse = transactions.some(t => t.owner === ownerToDelete);
    if (isOwnerInUse) {
      alert(`Cannot delete "${ownerToDelete}" because they are associated with existing transactions. Please reassign or delete the transactions first.`);
      return;
    }
    if (window.confirm(`Are you sure you want to delete the owner "${ownerToDelete}"?`)) {
      setOwners(prevOwners => prevOwners.filter(o => o !== ownerToDelete));
    }
  };

  const handleStartEditing = (owner: Owner) => {
    setEditingOwner({ oldName: owner, newName: owner });
  };
  
  const handleCancelEditing = () => {
    setEditingOwner(null);
  }

  const handleSaveEdit = () => {
    if (!editingOwner) return;

    const trimmedName = editingOwner.newName.trim();
    if (!trimmedName) {
      alert('Owner name cannot be empty.');
      return;
    }
    if (trimmedName.toLowerCase() !== editingOwner.oldName.toLowerCase() && owners.some(o => o.toLowerCase() === trimmedName.toLowerCase())) {
       alert('This owner name already exists.');
      return;
    }

    setOwners(prevOwners => prevOwners.map(o => (o === editingOwner.oldName ? trimmedName : o)));
    setTransactions(prevTransactions => prevTransactions.map(t => t.owner === editingOwner.oldName ? { ...t, owner: trimmedName } : t));
    setEditingOwner(null);
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Manage Owners</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Add New Owner</h3>
            <form onSubmit={handleAddOwner} className="flex space-x-2">
              <input
                type="text"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                placeholder="Enter owner name"
                className="flex-grow mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <button type="submit" className="inline-flex items-center justify-center p-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                <PlusIcon className="w-5 h-5" />
              </button>
            </form>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Existing Owners</h3>
            <ul className="space-y-2">
              {owners.map(owner => (
                <li key={owner} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  {editingOwner?.oldName === owner ? (
                    <input
                      type="text"
                      value={editingOwner.newName}
                      onChange={(e) => setEditingOwner({ ...editingOwner, newName: e.target.value })}
                      className="flex-grow mr-2 px-2 py-1 bg-white border border-indigo-500 rounded-md shadow-sm sm:text-sm"
                      autoFocus
                    />
                  ) : (
                    <span className="text-gray-800">{owner}</span>
                  )}
                  <div className="flex items-center space-x-2">
                    {editingOwner?.oldName === owner ? (
                      <>
                        <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-800">Save</button>
                        <button onClick={handleCancelEditing} className="text-gray-600 hover:text-gray-800">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleStartEditing(owner)} className="p-1 text-gray-500 hover:text-indigo-600" aria-label={`Edit ${owner}`}>
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteOwner(owner)} className="p-1 text-gray-500 hover:text-red-600" aria-label={`Delete ${owner}`}>
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
              {owners.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No owners found. Add one above to get started.</p>}
            </ul>
          </div>
        </div>

        <footer className="p-4 bg-gray-50 border-t flex justify-end">
            <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
              Done
            </button>
        </footer>
      </div>
    </div>
  );
};

export default ManageOwnersModal;