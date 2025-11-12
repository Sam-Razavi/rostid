import './config/env';
import http from 'http';
import app from './app';
import { env } from './config/env';
import { startTokenCleanup } from './utils/tokenCleanup';
import { prisma } from './config/prisma';

const PORT = env.PORT;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`[server] Rostid API running on port ${PORT} (${env.NODE_ENV})`);
  startTokenCleanup();
});

async function shutdown(signal: string) {
  console.log(`[server] ${signal} received — shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('[server] Closed');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('[server] Shutdown timeout — forcing exit');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
