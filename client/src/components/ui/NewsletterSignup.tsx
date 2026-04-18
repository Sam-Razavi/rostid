import { useState, FormEvent } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../api/client';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/newsletter/subscribe', { email });
      setDone(true);
      toast.success('You\'re subscribed!');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="bg-espresso-950 py-16 text-center">
        <div className="container-page">
          <div className="w-12 h-12 bg-espresso-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-serif text-xl text-white">You're on the list.</p>
          <p className="text-espresso-300 mt-1 text-sm">Thank you for joining the Rostid community.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-espresso-950 py-20">
      <div className="container-page max-w-xl text-center">
        <h2 className="font-serif text-3xl font-semibold text-white mb-3">
          Fresh beans, first
        </h2>
        <p className="text-espresso-300 mb-8 text-sm leading-relaxed">
          Get early access to new roasts, seasonal blends, and exclusive offers — delivered straight to your inbox.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-sm mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 px-4 py-3 rounded-lg bg-espresso-900 border border-espresso-700 text-white placeholder:text-espresso-500 focus:outline-none focus:ring-2 focus:ring-espresso-400 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-white text-espresso-950 font-medium rounded-lg hover:bg-stone-100 transition-colors text-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? '…' : 'Subscribe'}
          </button>
        </form>
        <p className="text-espresso-500 text-xs mt-4">No spam, ever. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
