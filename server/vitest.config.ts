import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/rostid_test',
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? 'test-access-secret-min-32-chars-long',
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? 'test-refresh-secret-min-32-chars-long',
      JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
      JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
      COOKIE_SECRET: process.env.COOKIE_SECRET ?? 'test-cookie-secret-16',
      CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
    },
    include: ['src/**/*.test.ts'],
    exclude: ['dist/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: { lines: 75 },
      exclude: [
        'dist/**',
        'prisma/**',
        'src/test/**',
        // Stripe-dependent code requires live Stripe keys / webhook signatures to test
        'src/modules/checkout/checkout.service.ts',
        'src/modules/webhooks/stripe.handler.ts',
        // Email templates and sender require a live Resend key to test
        'src/utils/email.ts',
        'src/utils/emails/**',
      ],
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
    sequence: { concurrent: false },
  },
});
