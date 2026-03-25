import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '../animations/variants';

export default function PaymentCancelPage() {
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
          className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-6"
        >
          <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.div>

        <motion.h1 variants={fadeUp} className="font-serif text-3xl font-semibold text-stone-900 mb-3">
          Payment cancelled
        </motion.h1>

        <motion.p variants={fadeUp} className="text-stone-500 text-lg mb-8">
          No charge was made. Your cart is still waiting for you.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/cart" className="btn-primary px-6 py-3 rounded-lg">
            Return to cart
          </Link>
          <Link to="/products" className="btn-secondary px-6 py-3 rounded-lg">
            Continue shopping
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
