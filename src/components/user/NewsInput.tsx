import React, { useState } from 'react';
import { FileText, Zap } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface NewsInputProps {
  onSubmit: (content: string) => Promise<void>;
  loading: boolean;
}

export const NewsInput: React.FC<NewsInputProps> = ({ onSubmit, loading }) => {
  const [content, setContent] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && !loading) {
      await onSubmit(content.trim());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    setCharCount(value.length);
  };

  const exampleNews = [
    "Scientists discover new species of butterfly in Amazon rainforest, contributing to biodiversity research.",
    "Local community center opens new literacy program for adults, offering free classes every weekend.",
    "Breakthrough in renewable energy: Solar panel efficiency reaches 30% in laboratory tests."
  ];

  const handleExampleClick = (example: string) => {
    setContent(example);
    setCharCount(example.length);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Verify News Article</h2>
          <p className="text-gray-600">Paste your news content for AI-powered verification</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="news-content" className="block text-sm font-medium text-gray-700 mb-3">
            News Article Content
          </label>
          <textarea
            id="news-content"
            value={content}
            onChange={handleChange}
            placeholder="Paste the full news article content here for analysis..."
            className="w-full h-48 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
            disabled={loading}
            required
            minLength={50}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              Minimum 50 characters required for accurate analysis
            </span>
            <span className={`text-xs font-medium ${
              charCount < 50 ? 'text-red-500' : 'text-green-600'
            }`}>
              {charCount} characters
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <p className="text-sm font-medium text-gray-700 md:col-span-3 mb-2">
            Try these examples:
          </p>
          {exampleNews.map((example, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleExampleClick(example)}
              className="text-left p-3 text-xs bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors duration-200"
              disabled={loading}
            >
              {example}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || content.trim().length < 50}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" color="text-white" />
              <span>Analyzing with AI...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              <span>Verify News Article</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};