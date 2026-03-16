import { useState, useEffect } from 'react';
import api from '../services/api';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (data) => {
    const res = await api.post('/users', data);
    await fetchUsers();
    return res.data;
  };

  const updateUser = async (id, data) => {
    const res = await api.put(`/users/${id}`, data);
    await fetchUsers();
    return res.data;
  };

  const deleteUser = async (id) => {
    await api.delete(`/users/${id}`);
    await fetchUsers();
  };

  return { users, loading, error, createUser, updateUser, deleteUser, refetch: fetchUsers };
};