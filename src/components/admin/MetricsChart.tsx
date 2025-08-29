import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ModelMetrics } from '../../types';

interface MetricsChartProps {
  metrics: ModelMetrics;
}

export const MetricsChart: React.FC<MetricsChartProps> = ({ metrics }) => {
  const data = [
    { name: 'Accuracy', value: metrics.accuracy * 100 },
    { name: 'Precision', value: metrics.precision * 100 },
    { name: 'Recall', value: metrics.recall * 100 },
    { name: 'F1 Score', value: metrics.f1Score * 100 }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Model Performance Metrics</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} className="dark:text-gray-300">
            <CartesianGrid strokeDasharray="3 3" className="dark:opacity-30" />
            <XAxis dataKey="name" className="dark:text-gray-300" />
            <YAxis domain={[0, 100]} className="dark:text-gray-300" />
            <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Score']} />
            <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};