import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'rostid_cookie_consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY));

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined');
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50"
          role="dialog"
          aria-label="Cookie consent"
        >
          <div className="bg-white rounded-2xl shadow-warm border border-stone-200 p-5">
            <p className="text-sm text-stone-700 font-medium mb-1">We use cookies</p>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              We use cookies to improve your experience. By continuing, you agree to our use of
              cookies.
            </p>
            <div className="flex items-center gap-2">
              <button onClick={accept} className="flex-1 btn-primary text-xs py-2 rounded-lg">
                Accept all
              </button>
              <button
                onClick={decline}
                className="flex-1 text-xs font-medium text-stone-500 hover:text-stone-700 py-2 transition-colors cursor-pointer"
              >
                Decline
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
