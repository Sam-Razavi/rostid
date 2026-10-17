import type { Transition, Variants } from 'framer-motion';

/*
 * Motion tokens — keep in sync with design-system/MASTER.md.
 * One easing family everywhere: a soft "expo-out" for entrances and a quick
 * ease-in for exits (exits run at ~60% of the entrance duration).
 */
export const ease = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
  in: [0.4, 0, 1, 1],
} as const;

export const duration = {
  fast: 0.18,
  base: 0.35,
  slow: 0.6,
  crawl: 0.9,
} as const;

export const spring = {
  press: { type: 'spring', stiffness: 420, damping: 30 },
  gentle: { type: 'spring', stiffness: 160, damping: 24 },
} satisfies Record<string, Transition>;

/** Shared viewport config for scroll-triggered reveals. */
export const inView = { once: true, margin: '0px 0px -80px 0px' } as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: ease.out },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: duration.fast, ease: ease.in },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.slow, ease: ease.out },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast, ease: ease.in },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

export const staggerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/** Editorial text reveal — the child slides up from behind an overflow-hidden mask. */
export const maskReveal: Variants = {
  hidden: { y: '110%' },
  visible: {
    y: '0%',
    transition: { duration: duration.crawl, ease: ease.out },
  },
};

/** Image reveal — a clip-path wipe paired with a slow settle from a slight zoom. */
export const imageReveal: Variants = {
  hidden: { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.12 },
  visible: {
    clipPath: 'inset(0% 0% 0% 0%)',
    scale: 1,
    transition: {
      clipPath: { duration: 1.1, ease: ease.inOut },
      scale: { duration: 1.6, ease: ease.out },
    },
  },
};

/** Horizontal rule that draws in from the left. */
export const lineGrow: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: duration.crawl, ease: ease.inOut },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: spring.gentle,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: duration.fast, ease: ease.in },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.base, ease: ease.out },
  },
  exit: {
    opacity: 0,
    x: -16,
    transition: { duration: duration.fast, ease: ease.in },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.base, ease: ease.out },
  },
  exit: {
    opacity: 0,
    x: 16,
    transition: { duration: duration.fast, ease: ease.in },
  },
};

export const listItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: ease.out },
  },
  exit: {
    opacity: 0,
    x: 24,
    transition: { duration: duration.fast, ease: ease.in },
  },
};
