import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
    } catch {
      // Silently ignore — always show success to prevent enumeration
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-stone-900 mb-2">Check your inbox</h1>
          <p className="text-stone-500 mb-8">
            If an account with <span className="font-medium text-stone-700">{email}</span> exists, we've sent a reset link. Check your spam folder if you don't see it.
          </p>
          <Link to="/login" className="text-espresso-700 hover:text-espresso-900 font-medium transition-colors text-sm">
            Back to sign in
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
          <h1 className="text-xl font-semibold text-stone-900 mt-4">Reset your password</h1>
          <p className="text-stone-500 mt-1 text-sm">Enter your email and we'll send you a reset link</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />

            <Button type="submit" loading={loading} size="lg" className="w-full">
              Send reset link
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-stone-500 mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-espresso-700 hover:text-espresso-900 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
