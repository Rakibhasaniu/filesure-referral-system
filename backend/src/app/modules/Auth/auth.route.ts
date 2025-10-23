import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { registerLimiter, authLimiter } from '../../middlewares/rateLimiter';
import { USER_ROLE } from '../User/user.constant';
import { AuthControllers } from './auth.controller';
import { AuthValidation } from './auth.validation';

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: rakib@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: password123
 *               referralCode:
 *                 type: string
 *                 description: Optional referral code from another user
 *                 example: RAKIB123
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User registered successfully!
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: U-000001
 *                         email:
 *                           type: string
 *                           example: rakib@example.com
 *                         referralCode:
 *                           type: string
 *                           example: RAKIB456
 *       409:
 *         description: Email already registered
 *       404:
 *         description: Invalid referral code
 */
router.post(
  '/register',
  registerLimiter, // 3 registrations per hour per IP
  validateRequest(AuthValidation.registerValidationSchema),
  AuthControllers.registerUser,
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user with email or user ID
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - password
 *             properties:
 *               id:
 *                 type: string
 *                 description: User ID or email address
 *                 example: rakib@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *           examples:
 *             emailLogin:
 *               summary: Login with email
 *               value:
 *                 id: rakib@example.com
 *                 password: password123
 *             userIdLogin:
 *               summary: Login with user ID
 *               value:
 *                 id: U-000001
 *                 password: password123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User is logged in successfully!
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     needsPasswordChange:
 *                       type: boolean
 *       404:
 *         description: User not found
 *       403:
 *         description: Invalid credentials or user blocked
 *       429:
 *         description: Too many login attempts, try again later
 */
router.post(
  '/login',
  authLimiter, // 5 failed login attempts per 15 minutes per IP
  validateRequest(AuthValidation.loginValidationSchema),
  AuthControllers.loginUser,
);

router.post(
  '/change-password',
  auth(
    USER_ROLE.superAdmin,
    USER_ROLE.admin,
    USER_ROLE.user,
  ),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthControllers.changePassword,
);

router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshTokenValidationSchema),
  AuthControllers.refreshToken,
);

router.post(
  '/forget-password',
  validateRequest(AuthValidation.forgetPasswordValidationSchema),
  AuthControllers.forgetPassword,
);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.forgetPasswordValidationSchema),
  AuthControllers.resetPassword,
);

export const AuthRoutes = router;
