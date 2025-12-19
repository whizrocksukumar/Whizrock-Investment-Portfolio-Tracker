import React, { useState } from 'react';
import { XIcon } from './icons';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
    } else {
        alert("Please enter a valid API key.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Enter Your Gemini API Key</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            To use the AI Smart Summary feature, you need to provide your own Google Gemini API key.
            Your key is used only for this session and is not stored. Please save your key securely for future use.
          </p>
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">API Key</label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your API key"
            />
          </div>
          <p className="text-xs text-gray-500">
            Don't have a key?{' '}
            <a href="https://ai.google.dev/gemini-api/docs/api-key" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              Get an API key from Google AI Studio
            </a>
          </p>
        </div>
        <footer className="p-4 bg-gray-50 border-t flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleSave} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              Save and Continue
            </button>
        </footer>
      </div>
    </div>
  );
};

export default ApiKeyModal;
