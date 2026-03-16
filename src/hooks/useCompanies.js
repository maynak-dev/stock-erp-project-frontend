import { useState, useEffect } from 'react';
import api from '../services/api';

export const useCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/companies');
      setCompanies(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const createCompany = async (data) => {
    const res = await api.post('/companies', data);
    await fetchCompanies();
    return res.data;
  };

  const updateCompany = async (id, data) => {
    const res = await api.put(`/companies/${id}`, data);
    await fetchCompanies();
    return res.data;
  };

  const deleteCompany = async (id) => {
    await api.delete(`/companies/${id}`);
    await fetchCompanies();
  };

  return { companies, loading, error, createCompany, updateCompany, deleteCompany, refetch: fetchCompanies };
};