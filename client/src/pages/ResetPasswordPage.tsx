import { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../api/client';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const uid = searchParams.get('uid') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (!token || !uid) {
      setError('Invalid or missing reset link');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', { userId: uid, token, password });
      setDone(true);
      toast.success('Password updated!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Invalid or expired reset link';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-stone-900 mb-2">Password updated</h1>
          <p className="text-stone-500 mb-8">Redirecting you to sign in…</p>
          <Link to="/login" className="text-espresso-700 hover:text-espresso-900 font-medium transition-colors text-sm">
            Sign in now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-serif text-3xl font-semibold text-espresso-950">Rostid</Link>
          <h1 className="text-xl font-semibold text-stone-900 mt-4">Choose a new password</h1>
          <p className="text-stone-500 mt-1 text-sm">Must be at least 8 characters</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="New password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
            />
            <Input
              label="Confirm password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your new password"
              required
              autoComplete="new-password"
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full">
              Update password
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-stone-500 mt-6">
          <Link to="/login" className="text-espresso-700 hover:text-espresso-900 font-medium transition-colors">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
