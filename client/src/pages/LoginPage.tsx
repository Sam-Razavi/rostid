import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { login } from '../api/auth.api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      setAuth(result.user, result.accessToken);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Invalid email or password';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-serif text-3xl font-semibold text-espresso-950">Rostid</Link>
          <h1 className="text-xl font-semibold text-stone-900 mt-4">Welcome back</h1>
          <p className="text-stone-500 mt-1 text-sm">Sign in to your account</p>
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
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-stone-700">Password</span>
                <Link to="/forgot-password" className="text-xs text-espresso-700 hover:text-espresso-900 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full">
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-stone-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-espresso-700 hover:text-espresso-900 font-medium transition-colors">
            Create one
          </Link>
        </p>

        <div className="mt-6 p-4 bg-stone-50 rounded-xl text-xs text-stone-500 space-y-1">
          <p className="font-medium text-stone-600">Demo accounts:</p>
          <p>admin@rostid.se / admin123</p>
          <p>customer@rostid.se / password123</p>
        </div>
      </div>
    </div>
  );
}
