import { useState, useEffect } from 'react';
import api from '../services/api';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const createCategory = async (data) => { const r = await api.post('/categories', data); await fetchCategories(); return r.data; };
  const updateCategory = async (id, data) => { const r = await api.put(`/categories/${id}`, data); await fetchCategories(); return r.data; };
  const deleteCategory = async (id) => { await api.delete(`/categories/${id}`); await fetchCategories(); };

  return { categories, loading, error, createCategory, updateCategory, deleteCategory, refetch: fetchCategories };
};
