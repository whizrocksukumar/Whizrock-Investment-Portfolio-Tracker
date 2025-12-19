
import React from 'react';
import { XIcon } from './icons';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const csvContent = "Stock Symbol,Company Name,ISIN Code,Owner,Action,Quantity,Transaction Price,Brokerage,Stamp Duty,Transaction Charges,Broker,Exchange,Transaction Date\nAAPL,Apple Inc.,US0378331005,Family,Buy,10,150.00,5.00,1.00,0.50,Fidelity,NASDAQ,2023-01-15\nGOOGL,Alphabet Inc.,US02079K3059,Family,Buy,5,100.00,4.50,0.90,0.50,Fidelity,NASDAQ,2023-02-20";
  const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
  
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">How to Use the Tracker</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6 overflow-y-auto text-gray-700 text-sm space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                <h3 className="font-bold text-yellow-800 text-base mb-1">Important: Data Persistence</h3>
                <p>This is a browser-based application. <strong className="font-semibold">Your data is NOT saved permanently.</strong> If you close or refresh your browser tab, the portfolio will reset to the initial sample data. Always use the "Download Report" button to save a copy of your portfolio and AI summaries before closing the application.</p>
            </div>

            <div>
                <h3 className="font-bold text-base mb-2">Getting Started</h3>
                <p>This application loads with sample investment data so you can explore its features right away. You can add your own transactions manually or prepare your data in a CSV file. Download our sample template to see the required format: <a href={encodedUri} download="whizrock_investment_tracker_sample_file.csv" className="text-indigo-600 hover:underline font-medium">Download Sample CSV</a></p>
            </div>
            
             <div>
                {/* FIX: Removed API key instructions to adhere to guidelines. */}
                <h3 className="font-bold text-base mb-2">Using the AI Smart Summary</h3>
                 <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Click the "Generate Analysis" buttons to get AI-powered summaries of your portfolio or individual stock holdings.</li>
                    <li>The AI analysis provides insights into performance and potential recommendations.</li>
                    <li>Please note that AI-generated content is for informational purposes only and should not be considered financial advice.</li>
                </ul>
            </div>

            <div>
                <h3 className="font-bold text-base mb-2">Portfolio Overview</h3>
                <ul className="list-disc list-inside space-y-1 pl-2">
                    <li><strong className="font-semibold">Main Cards:</strong> These show your total investment, current value, profit/loss, and annualized return.</li>
                    <li><strong className="font-semibold">Currency Selector:</strong> Change the display currency for all monetary values.</li>
                    <li><strong className="font-semibold">Upload CSV:</strong> Click this to open a dialog for uploading a CSV file of your transactions. This will replace any existing data.</li>
                </ul>
            </div>

            <div>
                <h3 className="font-bold text-base mb-2">Managing Your Portfolio</h3>
                <ul className="list-disc list-inside space-y-1 pl-2">
                    <li><strong className="font-semibold">Read Me:</strong> Opens this help guide.</li>
                    <li><strong className="font-semibold">Manage Owners:</strong> Add, rename, or delete owners (e.g., family members). Note: An owner with existing transactions cannot be deleted.</li>
                    <li><strong className="font-semibold">Add Transaction:</strong> The primary way to add new "Buy" or "Sell" records to your portfolio.</li>
                    <li><strong className="font-semibold">Download Report:</strong> Exports your current portfolio holdings and any generated AI summaries to a single CSV file. This is crucial for saving your data!</li>
                </ul>
            </div>
        </div>
        
        <footer className="p-4 bg-gray-50 border-t flex justify-end">
            <button type="button" onClick={onClose} className="bg-indigo-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700">
              Close
            </button>
        </footer>
      </div>
    </div>
  );
};

export default HelpModal;
