import { CartRoutes } from '@modules/cart/cart.route.js';
import { CategoryRoutes } from '@modules/category/category.route.js';
import { CouponRoutes } from '@modules/coupon/coupon.route.js';
import { ProductDiscountRoutes } from '@modules/discount/discount.route.js';
import { NotificationRoutes } from '@modules/notification/notification.route.js';
import { OrderRoutes } from '@modules/order/order.route.js';
import { ProductRoutes } from '@modules/products/products.route.js';
import { ReviewRoutes } from '@modules/review/review.route.js';
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
  {
    path: '/orders',
    route: OrderRoutes,
  },
  {
    path: '/reviews',
    route: ReviewRoutes,
  },
  {
    path: '/discounts',
    route: ProductDiscountRoutes,
  },
  {
    path: '/coupons',
    route: CouponRoutes,
  },
  {
    path: '/notifications',
    route: NotificationRoutes,
  },
  {
    path: '/categories',
    route: CategoryRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
