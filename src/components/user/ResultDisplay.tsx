import React from 'react';
import { CheckCircle, XCircle, Brain, Cpu, Clock } from 'lucide-react';
import { NewsArticle } from '../../types';
import { ConfidenceBar } from '../common/ConfidenceBar';

interface ResultDisplayProps {
  result: NewsArticle;
  onReset: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onReset }) => {
  const isReal = result.prediction === 'REAL';
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-4xl mx-auto transition-colors duration-300">
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
          isReal 
            ? 'bg-green-100 dark:bg-green-900 text-green-600' 
            : 'bg-red-100 dark:bg-red-900 text-red-600'
        }`}>
          {isReal ? (
            <CheckCircle className="w-10 h-10" />
          ) : (
            <XCircle className="w-10 h-10" />
          )}
        </div>
        
        <h2 className={`text-3xl font-bold mb-2 ${
          isReal ? 'text-green-700' : 'text-red-700'
        }`}>
          {isReal ? '✅ REAL NEWS' : '❌ FAKE NEWS'}
        </h2>
        
        <p className="text-gray-600 text-lg">
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Our AI analysis indicates this article is likely {result.prediction.toLowerCase()}
        </p>
      </div>

      <div className="space-y-6">
        <ConfidenceBar confidence={result.confidence} prediction={result.prediction} />

        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 transition-colors duration-200">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Analysis Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              {result.method === 'AI' ? (
                <Brain className="w-5 h-5 text-blue-600" />
              ) : (
                <Cpu className="w-5 h-5 text-purple-600" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Detection Method</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {result.method === 'AI' ? 'Google AI Model' : 'ML Fallback'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Analyzed At</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Reliability</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {result.confidence > 0.8 ? 'High' : 'Medium'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-6 border-l-4 ${
          isReal 
            ? 'bg-green-50 dark:bg-green-900/30 border-green-400' 
            : 'bg-red-50 dark:bg-red-900/30 border-red-400'
        }`}>
          <h4 className={`font-semibold mb-2 ${
            isReal ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
          }`}>
            {isReal ? 'Why this appears to be real:' : 'Why this appears to be fake:'}
          </h4>
          <ul className={`text-sm space-y-1 ${
            isReal ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
          }`}>
            {isReal ? (
              <>
                <li>• Consistent factual information</li>
                <li>• Credible sources and references</li>
                <li>• Balanced reporting tone</li>
                <li>• Verifiable claims and data</li>
              </>
            ) : (
              <>
                <li>• Sensational or misleading language detected</li>
                <li>• Lack of credible source attribution</li>
                <li>• Potential bias or emotional manipulation</li>
                <li>• Inconsistent or unverifiable claims</li>
              </>
            )}
          </ul>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onReset}
            className="flex-1 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
          >
            Analyze Another Article
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Save Result
          </button>
        </div>
      </div>
    </div>
  );
};