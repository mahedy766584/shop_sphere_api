// src/constants/errorMessages.ts

export const ErrorMessages = {
  AUTH: {
    USER_NOT_FOUND: 'User not found. Please check the username or register a new account.',
    INVALID_PASSWORD: 'Invalid password. Please try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    TOKEN_EXPIRED: 'Authentication token has expired. Please login again.',
    TOKEN_REVOKED: 'Token revoked. Please login again.',
    INVALID_TOKEN: 'Invalid authentication token.',
    ACCESS_DENIED: 'Access denied. You do not have permission to perform this action.',
    PASSWORD_CHANGED: 'Password changed after token was issued. Please login again.',
    EXPIRED_TOKEN: 'Refresh token invalid or expired',
    EMAIL_HAS_VERIFIED: 'Email already verified',
  },

  USER: {
    ALREADY_EXISTS: 'A user with this email already exists.',
    INVALID_INPUT: 'Invalid user input. Please check the data and try again.',
    NOT_FOUND: 'The requested user account was not found in our system.',
    INACTIVE: 'This user account is inactive.',
    EMAIL_NOT_VERIFIED: 'Please verify your email before logging in.',
    BANNED: 'Your account has been banned. Please contact support for assistance.',
    DELETED: 'This account has been deleted. Please create a new account to continue.',
    BLOCKED: 'Your account is currently blocked. Please contact support for assistance.',
    SUSPENDED: 'Your account is currently suspended. Please contact support for assistance.',
    EMAIL_VERIFICATION_REQUIRED: 'Please verify your email first to continue.',
    USERNAME_EXIST: 'User already exists with this user name',
  },

  SELLER: {
    ONLY_CUSTOMER_CAN_APPLY: 'Only customers can apply to become sellers',
    ALREADY_PENDING: 'Your seller application is already pending',
    ALREADY_APPROVED: 'You are already an approved seller',
    ALREADY_REJECTED: 'Your previous application was rejected',
    SELLER_EXIST: 'Seller profile already exists',
    NOT_FOUND: 'Seller profile not found',
    NOT_VERIFIED: 'Your seller account is not verified to create products',
  },

  PRODUCT: {
    PRODUCT_EXIST: 'Product with this name and brand already exists.',
    NOT_ALLOWED_ATTRIBUTE: (field: string) => `Attribute "${field}" is not allowed.`,
  },

  VALIDATION: {
    REQUIRED_FIELD: (field: string) => `${field} is required.`,
    INVALID_FORMAT: (field: string) => `${field} format is invalid.`,
    MIN_LENGTH: (field: string, length: number) =>
      `${field} must be at least ${length} characters long.`,
    MAX_LENGTH: (field: string, length: number) => `${field} must not exceed ${length} characters.`,
    INVALID_VALUE: (field: string) => `${field} has an invalid value.`,
    NOT_ALLOWED: (field: string) => `You are not allowed to update this field: ${field}`,
  },

  SERVER: {
    INTERNAL_ERROR: 'Something went wrong on our end. Please try again later.',
    DATABASE_ERROR: 'Database operation failed. Please contact support.',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again later.',
    TIMEOUT: 'Request timed out. Please try again.',
  },

  DATABASE: {
    DUPLICATE_KEY: 'Duplicate key error. This record already exists.',
    CONNECTION_FAILED: 'Database connection failed. Please check the server.',
    NOT_FOUND: (entity: string) => `${entity} not found in the database.`,
  },

  PAYMENT: {
    FAILED: 'Payment process failed. Please try again.',
    INVALID_METHOD: 'Invalid payment method selected.',
    INSUFFICIENT_FUNDS: 'Insufficient funds. Please use another payment method.',
    ALREADY_PROCESSED: 'This payment has already been processed.',
  },

  FILE: {
    UPLOAD_FAILED: 'File upload failed. Please try again.',
    INVALID_TYPE: 'Invalid file type uploaded.',
    TOO_LARGE: 'File size is too large. Please upload a smaller file.',
    NOT_FOUND: 'Requested file was not found on the server.',
  },

  COMMON: {
    NOT_FOUND: 'The requested resource was not found.',
    BAD_REQUEST: 'Invalid request. Please check your input.',
    FORBIDDEN: 'You do not have permission to access this resource.',
    CONFLICT: 'Conflict occurred. The resource already exists.',
  },
};
