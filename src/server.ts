/* eslint-disable no-undef */
/* eslint-disable no-console */
import mongoose from 'mongoose';

import config from './app/config/index.js';
import app from './app.js';

const port = config.port;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    console.log('✅ Database connected');
    app.listen(port, () => {
      console.log(`✅ Server is running on ${port}`);
    });
  } catch (err) {
    console.error('❌ Startup failed:', err);
  }
}

main();
