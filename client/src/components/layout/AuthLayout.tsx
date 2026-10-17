import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { duration, ease, fadeUp, imageReveal, staggerSlow } from '../../animations/variants';

const AUTH_IMAGE =
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&q=80';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="container-page grid min-h-[calc(100vh-4rem)] items-center gap-12 py-12 lg:grid-cols-2 lg:gap-20">
      {/* Editorial image panel — desktop only */}
      <div
        className="relative hidden h-full max-h-[44rem] min-h-[34rem] overflow-hidden rounded-[2rem] bg-espresso-950 lg:block"
        aria-hidden="true"
      >
        <motion.img
          src={AUTH_IMAGE}
          alt=""
          variants={imageReveal}
          initial="hidden"
          animate="visible"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/90 via-espresso-950/20 to-transparent" />
        <motion.div
          className="absolute inset-x-10 bottom-10 text-white"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: duration.slow, ease: ease.out }}
        >
          <p className="font-serif text-3xl italic leading-snug">
            Roasted in small batches, every week, in Stockholm.
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.25em] text-espresso-300">
            Rostid · Stockholm
          </p>
        </motion.div>
      </div>

      <motion.div
        className="mx-auto w-full max-w-md"
        variants={staggerSlow}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp} className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-espresso-600">
            Rostid
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-stone-900">
            {title}
          </h1>
          <p className="mt-2 text-stone-500">{subtitle}</p>
        </motion.div>

        <motion.div variants={fadeUp}>{children}</motion.div>
      </motion.div>
    </div>
  );
}
