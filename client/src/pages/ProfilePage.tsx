import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { fetchAddresses, createAddress, deleteAddress, updateAddress, type ShippingAddress } from '../api/shipping.api';
import type { ApiResponse, User } from '../types';

function AddressBook() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const { data: addresses = [] } = useQuery({ queryKey: ['addresses'], queryFn: fetchAddresses });

  const add = useMutation({
    mutationFn: (data: Omit<ShippingAddress, 'id' | 'userId' | 'createdAt'>) => createAddress(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] });
      setShowForm(false);
      setName(''); setLine1(''); setCity(''); setPostalCode('');
      toast.success('Address added');
    },
  });

  const remove = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['addresses'] }); toast.success('Address removed'); },
  });

  const setDefault = useMutation({
    mutationFn: (id: string) => updateAddress(id, { isDefault: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  });

  return (
    <div className="card p-8 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-stone-900">Saved addresses</h2>
        <Button size="sm" variant="ghost" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ Add address'}
        </Button>
      </div>

      {addresses.length === 0 && !showForm && (
        <p className="text-sm text-stone-400 text-center py-4">No addresses saved yet.</p>
      )}

      <div className="space-y-3 mb-4">
        {addresses.map((addr) => (
          <div key={addr.id} className="flex items-start justify-between p-4 rounded-lg border border-stone-100 bg-stone-50">
            <div>
              <p className="text-sm font-medium text-stone-900">{addr.name}</p>
              <p className="text-sm text-stone-500">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
              <p className="text-sm text-stone-500">{addr.postalCode} {addr.city}</p>
              {addr.isDefault && <span className="text-xs text-espresso-700 font-medium mt-1 inline-block">Default</span>}
            </div>
            <div className="flex gap-2">
              {!addr.isDefault && (
                <button onClick={() => setDefault.mutate(addr.id)} className="text-xs text-stone-500 hover:text-stone-900 cursor-pointer">
                  Set default
                </button>
              )}
              <button onClick={() => remove.mutate(addr.id)} className="text-xs text-red-500 hover:text-red-700 cursor-pointer">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); add.mutate({ name, line1, city, postalCode, country: 'SE', isDefault: false, line2: null }); }}
          className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-100">
          <div className="col-span-2"><Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div className="col-span-2"><Input label="Address" value={line1} onChange={(e) => setLine1(e.target.value)} required /></div>
          <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
          <Input label="Postal code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
          <div className="col-span-2 flex justify-end">
            <Button type="submit" size="sm" loading={add.isPending}>Save address</Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user, setAuth, accessToken } = useAuthStore();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const { data } = await apiClient.patch<ApiResponse<{ user: User }>>('/users/me', { name, email });
      setAuth(data.data.user, accessToken!);
      toast.success('Profile updated');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update profile';
      toast.error(message);
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      await apiClient.patch('/users/me/password', { currentPassword, newPassword });
      toast.success('Password changed');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to change password';
      setPasswordError(message);
    } finally {
      setPasswordLoading(false);
    }
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container-page py-12 max-w-2xl">
      <h1 className="text-2xl font-semibold text-stone-900 mb-8">Account settings</h1>

      {/* Profile section */}
      <div className="card p-8 mb-6">
        <h2 className="text-lg font-semibold text-stone-900 mb-6">Profile</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <Input
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <div className="flex justify-end">
            <Button type="submit" loading={profileLoading}>
              Save changes
            </Button>
          </div>
        </form>
      </div>

      <AddressBook />

      {/* Password section */}
      <div className="card p-8">
        <h2 className="text-lg font-semibold text-stone-900 mb-6">Change password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            autoComplete="new-password"
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          {passwordError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{passwordError}</p>
          )}
          <div className="flex justify-end">
            <Button type="submit" loading={passwordLoading}>
              Update password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
