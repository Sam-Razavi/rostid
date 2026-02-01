import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { register } from '../api/auth.api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const result = await register(name, email, password);
      setAuth(result.user, result.accessToken);
      navigate('/');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-serif text-3xl font-semibold text-espresso-950">Rostid</Link>
          <h1 className="text-xl font-semibold text-stone-900 mt-4">Create your account</h1>
          <p className="text-stone-500 mt-1 text-sm">Start your coffee journey</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full">
              Create account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-stone-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-espresso-700 hover:text-espresso-900 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
