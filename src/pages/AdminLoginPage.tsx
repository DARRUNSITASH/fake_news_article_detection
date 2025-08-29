import React, { useState } from 'react';
import { LoginForm } from '../components/admin/LoginForm';
import api from '../services/api';

export const AdminLoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await api.login(password);
      
      if (result.success) {
        // Store token and redirect
        if (result.token) {
          localStorage.setItem('adminToken', result.token);
        }
        window.location.href = '/admin';
      } else {
        setError('Invalid password. Please try again.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return <LoginForm onLogin={handleLogin} loading={loading} error={error} />;
};