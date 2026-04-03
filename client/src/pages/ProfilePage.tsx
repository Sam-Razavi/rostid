import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import type { ApiResponse, User } from '../types';

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
