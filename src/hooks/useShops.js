import { useState, useEffect } from 'react';
import api from '../services/api';

export const useShops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const res = await api.get('/shops');
      setShops(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch shops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const createShop = async (data) => {
    const res = await api.post('/shops', data);
    await fetchShops();
    return res.data;
  };

  const updateShop = async (id, data) => {
    const res = await api.put(`/shops/${id}`, data);
    await fetchShops();
    return res.data;
  };

  const deleteShop = async (id) => {
    await api.delete(`/shops/${id}`);
    await fetchShops();
  };

  return { shops, loading, error, createShop, updateShop, deleteShop, refetch: fetchShops };
};