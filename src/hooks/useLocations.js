import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/locations');
      setLocations(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const createLocation = async (data) => {
    const res = await api.post('/locations', data);
    await fetchLocations();
    return res.data;
  };

  const updateLocation = async (id, data) => {
    const res = await api.put(`/locations/${id}`, data);
    await fetchLocations();
    return res.data;
  };

  const deleteLocation = async (id) => {
    await api.delete(`/locations/${id}`);
    await fetchLocations();
  };

  return { locations, loading, error, createLocation, updateLocation, deleteLocation, refetch: fetchLocations };
};