import rateLimit from 'express-rate-limit';

// Skip rate limiting in test environment
const skipRateLimiting = process.env.NODE_ENV === 'test';

export const generalLimiter = rateLimit({
  skip: () => skipRateLimiting,
  windowMs: 15 * 60 * 1000, 
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});


export const authLimiter = rateLimit({
  skip: () => skipRateLimiting,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, 
  message: {
    success: false,
    message:
      'Too many authentication attempts from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, 
});


export const registerLimiter = rateLimit({
  skip: () => skipRateLimiting,
  windowMs: 60 * 60 * 1000, 
  max: 5, // Limit each IP to 5 registrations per hour
  message: {
    success: false,
    message:
      'Too many accounts created from this IP, please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const purchaseLimiter = rateLimit({
  skip: () => skipRateLimiting,
  windowMs: 60 * 60 * 1000,
  max: 15, 
  message: {
    success: false,
    message: 'Too many purchase requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const dashboardLimiter = rateLimit({
  skip: () => skipRateLimiting,
  windowMs: 5 * 60 * 1000, 
  max: 30,
  message: {
    success: false,
    message: 'Too many dashboard requests, please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
