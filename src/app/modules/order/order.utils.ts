import Stripe from 'stripe';

import config from '@config/index.js';

export const stripe = new Stripe(config.stripe_secret_key as string, {
  apiVersion: '2025-09-30.clover',
});
