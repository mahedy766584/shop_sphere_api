import { CartRoutes } from '@modules/cart/cart.route.js';
import { ProductRoutes } from '@modules/products/products.route.js';
import { SellerProfileRoutes } from '@modules/seller/seller.route.js';
import { ShopRoutes } from '@modules/shop/shop.route.js';
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
  {
    path: '/shops',
    route: ShopRoutes,
  },
  {
    path: '/carts',
    route: CartRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
