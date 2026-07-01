import { createApp } from './app.js';
import { env } from './env.js';
import { migrate, db } from './db/index.js';
import { ensureSeeded } from './db/seed.js';

async function main() {
  await migrate();
  await ensureSeeded();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`🏋️  Forge API listening on http://localhost:${env.PORT}`);
    console.log(`   Environment: ${env.NODE_ENV}`);
    console.log(`   Database: ${db.dialect}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received, shutting down...`);
    server.close(async () => {
      await db.close();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
