import { useState, useEffect } from 'react';
import api from '../services/api';

export const useReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/returns');
      setReturns(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch returns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const createReturn = async (data) => {
    const res = await api.post('/returns', data);
    await fetchReturns();
    return res.data;
  };

  const approveReturn = async (id) => {
    const res = await api.put(`/returns/${id}/approve`);
    await fetchReturns();
    return res.data;
  };

  const rejectReturn = async (id) => {
    const res = await api.put(`/returns/${id}/reject`);
    await fetchReturns();
    return res.data;
  };

  return { returns, loading, error, createReturn, approveReturn, rejectReturn, refetch: fetchReturns };
};