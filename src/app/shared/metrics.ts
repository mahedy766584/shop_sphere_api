import promBundle from 'express-prom-bundle';
import { collectDefaultMetrics, Counter, Registry } from 'prom-client';

// 1️⃣ Create a custom registry (সব metrics এখানে store হবে)
export const metricsRegistry = new Registry();

// 2️⃣ Collect Node.js system metrics (CPU, Memory, Event Loop, etc.)
collectDefaultMetrics({
  register: metricsRegistry,
});

// 3️⃣ Express middleware → সব API request trace করবে
export const metricsMiddleware = promBundle({
  includeMethod: true, // GET/POST etc দেখাবে
  includePath: true, // কোন route hit হলো
  autoregister: false, // custom registry ব্যবহার করবো, তাই auto না
});

// 4️⃣ Custom metrics (Cart service এর জন্য)
export const cartMetrics = {
  cartAdds: new Counter({
    name: 'cart_add_total',
    help: 'Total number of items added to cart',
    registers: [metricsRegistry],
  }),
  cartCheckouts: new Counter({
    name: 'cart_checkout_total',
    help: 'Total number of cart checkouts',
    registers: [metricsRegistry],
  }),
};
