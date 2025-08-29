import React, { useState } from 'react';
import { Shield, Brain, TrendingUp } from 'lucide-react';
import { NewsInput } from '../components/user/NewsInput';
import { ResultDisplay } from '../components/user/ResultDisplay';
import { NewsArticle } from '../types';
import api from '../services/api';

export const UserPage: React.FC = () => {
  const [result, setResult] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (content: string) => {
    setLoading(true);
    try {
      const result = await api.verifyNews(content);
      setResult(result);
    } catch (error) {
      console.error('Error verifying news:', error);
      // Handle error state
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FakeNews Detector</h1>
                <p className="text-sm text-gray-600">AI-Powered News Verification</p>
              </div>
            </div>
            <a
              href="/admin"
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Admin Panel
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!result && (
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Verify News with
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> AI Power</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Advanced machine learning and Google AI technology to detect fake news with high accuracy. 
              Get instant results with confidence scores.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/50">
                <Brain className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
                <p className="text-sm text-gray-600">
                  Google's advanced AI model for accurate news verification
                </p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/50">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">High Accuracy</h3>
                <p className="text-sm text-gray-600">
                  87% accuracy with confidence scoring for reliability
                </p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/50">
                <Shield className="w-8 h-8 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Dual Verification</h3>
                <p className="text-sm text-gray-600">
                  AI model with ML fallback for maximum reliability
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {result ? (
            <ResultDisplay result={result} onReset={handleReset} />
          ) : (
            <NewsInput onSubmit={handleSubmit} loading={loading} />
          )}
        </div>
      </main>
    </div>
  );
};