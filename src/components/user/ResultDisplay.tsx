import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, RotateCcw } from 'lucide-react';
import { ConfidenceBar } from '../common/ConfidenceBar';
import { useTheme } from '../../contexts/ThemeContext';

interface NewsArticle {
  title: string;
  content: string;
  prediction: 'real' | 'fake';
  confidence: number;
}

interface ResultDisplayProps {
  result: NewsArticle;
  onReset: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onReset }) => {
  const { theme } = useTheme();
  
  const getResultIcon = () => {
    if (result.confidence >= 0.8) {
      return result.prediction === 'real' ? 
        <CheckCircle className="w-8 h-8 text-green-500" /> : 
        <XCircle className="w-8 h-8 text-red-500" />;
    }
    return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
  };

  const getResultColor = () => {
    if (result.confidence >= 0.8) {
      return result.prediction === 'real' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    }
    return 'text-yellow-600 dark:text-yellow-400';
  };

  const getResultText = () => {
    if (result.confidence >= 0.8) {
      return result.prediction === 'real' ? 'Likely Real News' : 'Likely Fake News';
    }
    return 'Uncertain Classification';
  };

  return (
    <div className={`max-w-2xl mx-auto p-6 rounded-lg shadow-lg transition-colors duration-200 ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          {getResultIcon()}
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${getResultColor()}`}>
          {getResultText()}
        </h2>
        <ConfidenceBar confidence={result.confidence} />
      </div>

      <div className={`mb-6 p-4 rounded-lg ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
      }`}>
        <h3 className={`font-semibold mb-2 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
        }`}>
          Article Title:
        </h3>
        <p className={`mb-4 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {result.title}
        </p>
        
        <h3 className={`font-semibold mb-2 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
        }`}>
          Content Preview:
        </h3>
        <p className={`${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {result.content.substring(0, 200)}...
        </p>
      </div>

      <div className="text-center">
        <button
          onClick={onReset}
          className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
            theme === 'dark' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Analyze Another Article
        </button>
      </div>
    </div>
  );
};