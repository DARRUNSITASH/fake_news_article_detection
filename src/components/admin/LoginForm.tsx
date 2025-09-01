import React, { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface LoginFormProps {
  onLogin: (password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loading, error }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() && !loading) {
      await onLogin(password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md transition-colors duration-300">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Access</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Enter your credentials to access the admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Admin Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 transition-colors duration-200"
                placeholder="Enter admin password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3">
              <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" color="text-white" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Access Dashboard</span>
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
          <p className="text-xs text-gray-600 dark:text-gray-300 text-center">
            Demo credentials: <strong>admin123</strong>
          </p>
        </div>
      </div>
    </div>
  );
};