import type { JwtPayload } from 'jsonwebtoken';

export interface TJwtPayload extends JwtPayload {
  userId: string;
  userName?: string;
  role?: 'superAdmin' | 'admin' | 'seller' | 'customer';
}

declare global {
  namespace Express {
    interface Request {
      user: TJwtPayload;
    }
  }
}
