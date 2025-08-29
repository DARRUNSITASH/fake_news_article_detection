import React from 'react';

interface ConfusionMatrixProps {
  matrix: number[][];
}

export const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({ matrix }) => {
  const total = matrix.flat().reduce((sum, val) => sum + val, 0);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confusion Matrix</h3>
      <div className="grid grid-cols-3 gap-2 max-w-sm">
        <div></div>
        <div className="text-center text-sm font-medium text-gray-600 dark:text-gray-300">Real</div>
        <div className="text-center text-sm font-medium text-gray-600 dark:text-gray-300">Fake</div>
        
        <div className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center">Real</div>
        <div className="bg-green-100 dark:bg-green-900/50 p-4 rounded-lg text-center">
          <div className="text-xl font-bold text-green-800 dark:text-green-300">{matrix[0][0]}</div>
          <div className="text-xs text-green-600">
            {((matrix[0][0] / total) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-lg text-center">
          <div className="text-xl font-bold text-red-800 dark:text-red-300">{matrix[0][1]}</div>
          <div className="text-xs text-red-600">
            {((matrix[0][1] / total) * 100).toFixed(1)}%
          </div>
        </div>
        
        <div className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center">Fake</div>
        <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-lg text-center">
          <div className="text-xl font-bold text-red-800 dark:text-red-300">{matrix[1][0]}</div>
          <div className="text-xs text-red-600">
            {((matrix[1][0] / total) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-green-100 dark:bg-green-900/50 p-4 rounded-lg text-center">
          <div className="text-xl font-bold text-green-800 dark:text-green-300">{matrix[1][1]}</div>
          <div className="text-xs text-green-600">
            {((matrix[1][1] / total) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>Green: Correct predictions</p>
        <p>Red: Incorrect predictions</p>
      </div>
    </div>
  );
};