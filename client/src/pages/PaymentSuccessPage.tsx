import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '../animations/variants';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="container-page py-24 flex flex-col items-center text-center">
      <motion.div
        className="max-w-md"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={fadeUp}
          className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
        >
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="font-serif text-3xl font-semibold text-stone-900 mb-3"
        >
          Order confirmed!
        </motion.h1>

        <motion.p variants={fadeUp} className="text-stone-500 text-lg mb-2">
          Thank you for your purchase. Your coffee is on its way.
        </motion.p>

        {sessionId && (
          <motion.p variants={fadeUp} className="text-xs text-stone-400 font-mono mb-8">
            Ref: {sessionId.slice(-8).toUpperCase()}
          </motion.p>
        )}

        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row gap-3 justify-center mt-8"
        >
          <Link to="/orders" className="btn-primary px-6 py-3 rounded-lg">
            View your orders
          </Link>
          <Link to="/products" className="btn-secondary px-6 py-3 rounded-lg">
            Continue shopping
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
