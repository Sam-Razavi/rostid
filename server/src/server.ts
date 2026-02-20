import './config/env';
import app from './app';
import { env } from './config/env';
import { startTokenCleanup } from './utils/tokenCleanup';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`[server] Rostid API running on port ${PORT} (${env.NODE_ENV})`);
  startTokenCleanup();
});
