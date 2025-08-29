import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Upload, 
  Database, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { StatsCard } from '../components/admin/StatsCard';
import { MetricsChart } from '../components/admin/MetricsChart';
import { ConfusionMatrix } from '../components/admin/ConfusionMatrix';
import { DatasetUpload } from '../components/admin/DatasetUpload';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Dataset, ModelMetrics, AdminStats } from '../types';
import api from '../services/api';

export const AdminPage: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [retrainLoading, setRetrainLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [datasetsData, metricsData, statsData] = await Promise.all([
        api.getDatasets(),
        api.getMetrics(),
        api.getStats()
      ]);
      setDatasets(datasetsData);
      setMetrics(metricsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setUploadLoading(true);
      const newDataset = await api.uploadDataset(file);
      setDatasets(prev => [newDataset, ...prev]);
    } catch (error) {
      console.error('Error uploading dataset:', error);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleRetrain = async () => {
    try {
      setRetrainLoading(true);
      await api.retrainModel();
      // Reload metrics after retraining
      const metricsData = await api.getMetrics();
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error retraining model:', error);
    } finally {
      setRetrainLoading(false);
    }
  };

  const handleLogout = () => {
    window.location.href = '/admin/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Fake News Detection System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Back to App
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Verifications"
              value={stats.totalVerifications.toLocaleString()}
              icon={Users}
              color="blue"
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Real News"
              value={stats.realNews.toLocaleString()}
              subtitle={`${Math.round((stats.realNews / stats.totalVerifications) * 100)}% of total`}
              icon={CheckCircle}
              color="green"
            />
            <StatsCard
              title="Fake News"
              value={stats.fakeNews.toLocaleString()}
              subtitle={`${Math.round((stats.fakeNews / stats.totalVerifications) * 100)}% of total`}
              icon={XCircle}
              color="red"
            />
            <StatsCard
              title="Avg Confidence"
              value={`${Math.round(stats.averageConfidence * 100)}%`}
              icon={TrendingUp}
              color="purple"
              trend={{ value: 3, isPositive: true }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Model Metrics */}
          {metrics && <MetricsChart metrics={metrics} />}
          
          {/* Confusion Matrix */}
          {metrics && <ConfusionMatrix matrix={metrics.confusionMatrix} />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dataset Upload */}
          <DatasetUpload onUpload={handleUpload} loading={uploadLoading} />

          {/* Dataset Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Training Datasets</h3>
              <button
                onClick={handleRetrain}
                disabled={retrainLoading || datasets.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {retrainLoading ? (
                  <>
                    <LoadingSpinner size="sm" color="text-white" />
                    <span>Retraining...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Retrain Model</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="space-y-4">
              {datasets.length > 0 ? (
                datasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
                  >
                    <Database className="w-8 h-8 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{dataset.filename}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{(dataset.size / 1024 / 1024).toFixed(2)} MB</span>
                        <span>{new Date(dataset.uploadedAt).toLocaleDateString()}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          dataset.processed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {dataset.processed ? 'Processed' : 'Processing'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No datasets uploaded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};