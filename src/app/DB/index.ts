import { USER_ROLE } from '@modules/user/user.constant.js';
import type { TUser } from '@modules/user/user.interface.js';
import { User } from '@modules/user/user.model.js';

import config from '@config/index.js';

const superAdmin: TUser = {
  name: {
    firstName: 'Mohammad',
    lastName: 'Mehedi Hasan',
  },
  userName: 'mehediweb2023',
  password: config.super_admin_password as string,
  email: config.super_admin_email as string,
  role: 'superAdmin',
  phone: '+8801700000000',
  address: {
    type: 'office',
    street: 'Admin Street 1',
    state: 'Dhaka',
    postalCode: '1200',
    country: 'Bangladesh',
    isDefault: true,
  },
  profileImage: 'https://ibb.co.com/kD3SmtC',
  isEmailVerified: true,
  status: 'active',
  isBanned: false,
  isDeleted: false,
  tokenVersion: 1,
  passwordChangedAt: new Date('2025-01-01T00:00:00.000Z'),
  emailVerifiedAt: new Date('2025-01-01T01:00:00.000Z'),
};

const seedSuperAdmin = async () => {
  const isSuperAdminExist = await User.findOne({ role: USER_ROLE.superAdmin });
  if (!isSuperAdminExist) {
    await User.create(superAdmin);
  }
};
export default seedSuperAdmin;
