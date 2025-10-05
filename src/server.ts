/* eslint-disable no-undef */
/* eslint-disable no-console */
import seedSuperAdmin from 'app/DB/index.js';
import type { Server } from 'http';
import mongoose from 'mongoose';

import app from './app.js';
import config from './app/config/index.js';

const port = config.port;

let server: Server;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    console.log('✅ Database connected');
    seedSuperAdmin();
    server = app.listen(port, () => {
      console.log(`✅ Server is running on ${port}`);
    });
  } catch (err) {
    console.error('❌ Startup failed:', err);
  }
}

main();

process.on('unhandledRejection', () => {
  console.log(`😡 UnhandledPromiseRejection is detected, shutting down the server!`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log(`😡 UncaughtException is detected, shutting down the server!`);
  process.exit(1);
});
