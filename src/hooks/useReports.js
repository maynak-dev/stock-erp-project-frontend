import { useState } from 'react';
import api from '../services/api';

export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStockReport = async (params) => {
    try {
      setLoading(true);
      const res = await api.get('/reports/stock', { params });
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch stock report');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchExpiryReport = async (params) => {
    try {
      setLoading(true);
      const res = await api.get('/reports/expiry', { params });
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch expiry report');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchReturnReport = async (params) => {
    try {
      setLoading(true);
      const res = await api.get('/reports/returns', { params });
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch return report');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesReport = async (params) => {
    try {
      setLoading(true);
      const res = await api.get('/reports/sales', { params });
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sales report');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchStockReport,
    fetchExpiryReport,
    fetchReturnReport,
    fetchSalesReport,
  };
};