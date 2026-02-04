import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from './router';
import { useAuthStore } from './store/authStore';
import { refreshSession, fetchMe } from './api/auth.api';

export default function App() {
  const [restoring, setRestoring] = useState(true);
  const { setAuth } = useAuthStore();

  useEffect(() => {
    async function restoreSession() {
      const token = await refreshSession();
      if (token) {
        const user = await fetchMe(token);
        if (user) {
          setAuth(user, token);
        }
      }
      setRestoring(false);
    }

    restoreSession();
  }, [setAuth]);

  if (restoring) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-stone-50">
        <div className="w-8 h-8 border-2 border-espresso-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1c1917',
            borderRadius: '0.75rem',
            border: '1px solid #e7e5e4',
            boxShadow: '0 4px 24px -4px rgba(94, 53, 22, 0.15)',
            fontSize: '0.875rem',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          success: {
            iconTheme: { primary: '#5E3516', secondary: '#faf6f1' },
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#fef2f2' },
          },
        }}
      />
    </>
  );
}
