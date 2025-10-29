import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { fetchAddresses, createAddress, deleteAddress, updateAddress, type ShippingAddress } from '../api/shipping.api';
import { fetchLoyaltyBalance } from '../api/loyalty.api';
import { checkPasswordStrength } from '../utils/passwordStrength';
import type { ApiResponse, User } from '../types';

const REASON_LABELS: Record<string, string> = {
  order_earn: 'Earned on order',
  redemption: 'Redeemed at checkout',
  adjustment: 'Manual adjustment',
};

function AddressBook() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['addresses'] }); toast.success('Address removed'); setConfirmDeleteId(null); },
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
              <button onClick={() => setConfirmDeleteId(addr.id)} className="text-xs text-red-500 hover:text-red-700 cursor-pointer">
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

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-warm">
            <h3 className="text-lg font-semibold text-stone-900 mb-2">Remove address?</h3>
            <p className="text-stone-500 text-sm mb-6">This address will be permanently deleted.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="text-sm font-medium text-stone-600 hover:text-stone-900 cursor-pointer min-h-[44px] px-4"
              >
                Cancel
              </button>
              <Button
                onClick={() => remove.mutate(confirmDeleteId)}
                loading={remove.isPending}
                className="bg-red-600 hover:bg-red-700 text-sm"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user, setAuth, accessToken, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data: loyalty } = useQuery({ queryKey: ['loyalty'], queryFn: fetchLoyaltyBalance });

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

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    try {
      await apiClient.delete('/users/me');
      clearAuth();
      navigate('/');
    } catch {
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container-page py-12 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-stone-900">Account settings</h1>
        {loyalty && (
          <div className="flex items-center gap-2 bg-espresso-50 border border-espresso-200 rounded-full px-4 py-1.5">
            <svg className="w-4 h-4 text-espresso-700" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium text-espresso-800">{loyalty.points} pts</span>
          </div>
        )}
      </div>

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

      {/* Loyalty points history */}
      {loyalty && (loyalty as unknown as { transactions?: Array<{ id: string; delta: number; reason: string; createdAt: string }> }).transactions && (
        <div className="card p-8 mb-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-1">Loyalty points</h2>
          <p className="text-sm text-stone-500 mb-5">
            You have <span className="font-semibold text-espresso-800">{loyalty.points} pts</span> — lifetime earned: {(loyalty as unknown as { lifetimeEarned?: number }).lifetimeEarned ?? 0} pts
          </p>
          {((loyalty as unknown as { transactions?: unknown[] }).transactions?.length ?? 0) === 0 ? (
            <p className="text-sm text-stone-400 text-center py-4">No transactions yet.</p>
          ) : (
            <div className="divide-y divide-stone-100">
              {(loyalty as unknown as { transactions: Array<{ id: string; delta: number; reason: string; createdAt: string }> }).transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="text-stone-700">{REASON_LABELS[tx.reason] ?? tx.reason}</p>
                    <p className="text-xs text-stone-400">{new Date(tx.createdAt).toLocaleDateString('sv-SE')}</p>
                  </div>
                  <span className={`font-semibold tabular-nums ${tx.delta > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.delta > 0 ? '+' : ''}{tx.delta} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Password section */}
      <div className="card p-8 mb-6">
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
          <div>
            <Input
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
            />
            {newPassword.length > 0 && (() => {
              const s = checkPasswordStrength(newPassword);
              return (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= s.score ? s.color : 'bg-stone-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-stone-500">{s.label}</p>
                </div>
              );
            })()}
          </div>
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

      {/* Delete account */}
      <div className="card p-8 border border-red-100">
        <h2 className="text-lg font-semibold text-stone-900 mb-2">Delete account</h2>
        <p className="text-sm text-stone-500 mb-5">
          Permanently anonymise your account and cancel active subscriptions. Order history is retained for legal purposes. This cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors cursor-pointer"
        >
          Delete my account
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-semibold text-stone-900 mb-2">Are you sure?</h3>
            <p className="text-sm text-stone-500 mb-5">
              Type <strong>DELETE</strong> to confirm. This will anonymise your account and cannot be undone.
            </p>
            <Input
              label=""
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
            />
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                className="text-sm font-medium text-stone-600 hover:text-stone-900 cursor-pointer px-4 min-h-[44px]"
              >
                Cancel
              </button>
              <Button
                onClick={handleDeleteAccount}
                loading={deleteLoading}
                disabled={deleteConfirmText !== 'DELETE'}
                className="bg-red-600 hover:bg-red-700 text-sm disabled:opacity-50"
              >
                Delete account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
