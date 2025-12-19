import React, { useState, useRef } from 'react';
import { XIcon, ArrowUpTrayIcon, ArrowDownTrayIcon } from './icons';

interface UploadCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

const UploadCSVModal: React.FC<UploadCSVModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const csvContent = "Stock Symbol,Company Name,ISIN Code,Owner,Action,Quantity,Transaction Price,Brokerage,Stamp Duty,Transaction Charges,Broker,Exchange,Transaction Date\nAAPL,Apple Inc.,US0378331005,Family,Buy,10,150.00,5.00,1.00,0.50,Fidelity,NASDAQ,2023-01-15\nGOOGL,Alphabet Inc.,US02079K3059,Family,Buy,5,100.00,4.50,0.90,0.50,Fidelity,NASDAQ,2023-02-20";
  const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);

  if (!isOpen) {
    return null;
  }
  
  const validateAndSetFile = (file: File | null | undefined) => {
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setError('');
      } else {
        setSelectedFile(null);
        setError('Please select a valid CSV file.');
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    validateAndSetFile(event.target.files?.[0]);
  };
  
  const handleBrowseClick = () => {
      fileInputRef.current?.click();
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    } else {
      setError('Please select a file to upload.');
    }
  };
  
  const handleClose = () => {
      setSelectedFile(null);
      setError('');
      setIsDraggingOver(false);
      onClose();
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
    validateAndSetFile(event.dataTransfer.files?.[0]);
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Upload CSV File</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-200">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="p-6 space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
            <p className="font-semibold">Instructions:</p>
            <ul className="list-disc list-inside mt-1">
              <li>The uploaded CSV file will <strong className="font-semibold">replace all existing transaction data</strong>.</li>
              <li>Column headers must <strong className="font-semibold">exactly match</strong> the sample file.</li>
              <li>
                <a href={encodedUri} download="whizrock_investment_tracker_sample_file.csv" className="text-indigo-600 hover:underline font-medium">
                  Download Sample File
                </a>
              </li>
            </ul>
          </div>
          
          <div className="flex items-center justify-center w-full">
            <div 
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${isDraggingOver ? 'border-indigo-600' : 'border-gray-300'}`}
              onClick={handleBrowseClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ArrowUpTrayIcon className="w-8 h-8 mb-2 text-gray-500"/>
                    <p className="mb-2 text-sm text-gray-500">
                        {selectedFile ? 
                        <span className="font-semibold text-green-600">{selectedFile.name}</span> : 
                        <><span className="font-semibold">Click to browse</span> or drag and drop</>
                        }
                    </p>
                    <p className="text-xs text-gray-500">CSV files only</p>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        </div>
        <footer className="p-4 bg-gray-50 border-t flex justify-end space-x-3">
            <button type="button" onClick={handleClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleUpload} disabled={!selectedFile} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
              Upload File
            </button>
        </footer>
      </div>
    </div>
  );
};

export default UploadCSVModal;
