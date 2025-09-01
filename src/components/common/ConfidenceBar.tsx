import React from 'react';

interface ConfidenceBarProps {
  confidence: number;
  prediction: 'REAL' | 'FAKE';
}

export const ConfidenceBar: React.FC<ConfidenceBarProps> = ({ confidence, prediction }) => {
  const percentage = Math.round(confidence * 100);
  const isReal = prediction === 'REAL';
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Confidence Score
        </span>
        <span className={`text-sm font-bold ${
          isReal ? 'text-green-600' : 'text-red-600'
        }`}>
          {percentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-1000 ease-out ${
            isReal 
              ? 'bg-gradient-to-r from-green-400 to-green-600' 
              : 'bg-gradient-to-r from-red-400 to-red-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};