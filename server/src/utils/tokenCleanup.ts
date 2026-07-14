import { prisma } from '../config/prisma';

async function deleteExpiredTokens(): Promise<void> {
  const result = await prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  if (result.count > 0) {
    console.log(`[tokenCleanup] Deleted ${result.count} expired refresh token(s)`);
  }
}

export function startTokenCleanup(): void {
  deleteExpiredTokens().catch((err) =>
    console.error('[tokenCleanup] Initial cleanup failed:', err)
  );

  const INTERVAL_MS = 24 * 60 * 60 * 1000;
  setInterval(() => {
    deleteExpiredTokens().catch((err) =>
      console.error('[tokenCleanup] Scheduled cleanup failed:', err)
    );
  }, INTERVAL_MS).unref();
}
