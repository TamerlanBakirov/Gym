import { createApp } from './app.js';
import { env } from './env.js';
import { migrate } from './db/database.js';
import { ensureSeeded } from './db/seed.js';

migrate();
ensureSeeded();

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`🏋️  Forge API listening on http://localhost:${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
});

const shutdown = (signal: string) => {
  console.log(`\n${signal} received, shutting down...`);
  server.close(() => process.exit(0));
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
