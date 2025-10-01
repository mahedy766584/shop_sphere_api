import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  password_salt_rounds: process.env.PASSWORD_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_email_secret: process.env.JWT_EMAIL_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  reset_pass_ui_link: process.env.RESET_PASS_UI_LINK,
  frontend_url: process.env.FRONTEND_URL,
  api_base_url: process.env.API_BASE_URL,
  smtp_host: process.env.SMTP_HOST,
  smtp_port: process.env.SMTP_PORT,
  smtp_host_mail: process.env.SMTP_HOST_MAIL,
  smtp_pass: process.env.SMTP_PASS,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  email_verification_expires_in: process.env.EMAIL_VERIFICATION_EXPIRES_IN,
  redis_url: process.env.REDIS_URL,
  cache_ttl: process.env.CACHE_TTL,
  stripe_secret_key: process.env.STRIPE_SECRET_KEY,
};
