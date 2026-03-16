import { useState, useEffect } from 'react';
import api from '../services/api';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const createProduct = async (data) => {
    const res = await api.post('/products', data);
    await fetchProducts();
    return res.data;
  };

  const updateProduct = async (id, data) => {
    const res = await api.put(`/products/${id}`, data);
    await fetchProducts();
    return res.data;
  };

  const deleteProduct = async (id) => {
    await api.delete(`/products/${id}`);
    await fetchProducts();
  };

  return { products, loading, error, createProduct, updateProduct, deleteProduct, refetch: fetchProducts };
};