import { ProductRoutes } from '@modules/products/products.route.js';
import { SellerProfileRoutes } from '@modules/seller/seller.route.js';
import { AuthRoutes } from 'app/modules/Auth/auth.route.js';
import { Router } from 'express';

import { UserRoutes } from '../modules/user/user.route.js';

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/products',
    route: ProductRoutes,
  },
  {
    path: '/sellers',
    route: SellerProfileRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
