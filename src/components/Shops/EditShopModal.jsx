import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ModalShell, { M, Field, TextArea, Select } from '../ModalShell';

const schema = z.object({
  locationId: z.string().min(1, 'Location is required'),
  name: z.string().min(1, 'Shop name is required'),
  address: z.string().optional(),
});

export default function EditShopModal({ isOpen, onClose, shop, onSuccess }) {
  const { user } = useAuth();
  const [locations, setLocations] = useState([]);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!isOpen || !shop) return;
    api.get('/locations').then(r => setLocations(r.data)).catch(console.error);
    // KEY FIX: populate form with the shop's actual current data
    reset({
      locationId: shop.locationId ?? '',
      name:       shop.name       ?? '',
      address:    shop.address    ?? '',
    });
  }, [isOpen, shop, reset]);

  const handleClose = () => { reset(); onClose(); };

  const onSubmit = async (data) => {
    try {
      await api.put(`/shops/${shop.id}`, data);
      toast.success('Shop updated');
      onSuccess();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to update'); }
  };

  const isLocationLocked = user.role === 'LOCATION_MANAGER' && !!user.locationId;

  return (
    <ModalShell isOpen={isOpen} onClose={handleClose} title="Edit Shop">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Select label="Location" name="locationId" register={register} errors={errors} required disabled={isLocationLocked}>
          <option value="">Select location</option>
          {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </Select>
        <Field label="Shop Name" name="name" register={register} errors={errors} required />
        <TextArea label="Address" name="address" register={register} />
        <div style={M.footer}>
          <button type="button" onClick={handleClose} style={M.btnCancel}>Cancel</button>
          <button type="submit" disabled={isSubmitting} style={{ ...M.btnSubmit, opacity: isSubmitting ? .6 : 1 }}>
            {isSubmitting ? 'Saving…' : 'Update Shop'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
