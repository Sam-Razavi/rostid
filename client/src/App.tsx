import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
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

  return <RouterProvider router={router} />;
}
