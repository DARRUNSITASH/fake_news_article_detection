import React, { useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface DatasetUploadProps {
  onUpload: (file: File) => Promise<void>;
  loading: boolean;
}

export const DatasetUpload: React.FC<DatasetUploadProps> = ({ onUpload, loading }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.endsWith('.csv'));
    
    if (csvFile) {
      setSelectedFile(csvFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (selectedFile && !loading) {
      await onUpload(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload Training Dataset</h3>
      
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver 
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/30' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Drop your CSV file here, or{' '}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
              disabled={loading}
            >
              browse
            </button>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            CSV files with 'content' and 'label' columns supported
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            disabled={loading}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={removeFile}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" color="text-white" />
                <span>Uploading...</span>
              </>
            ) : (
              <span>Upload Dataset</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};