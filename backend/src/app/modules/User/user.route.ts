/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import auth from '../../middlewares/auth';

import { USER_ROLE } from './user.constant';
import { UserControllers } from './user.controller';

const router = express.Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current logged-in user information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
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
 *                   example: User is retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: U-000001
 *                     email:
 *                       type: string
 *                       example: rakib@example.com
 *                     referralCode:
 *                       type: string
 *                       example: RAKIB456
 *                     credits:
 *                       type: number
 *                       example: 10
 *                     hasPurchased:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get(
  '/me',
  auth(
    USER_ROLE.superAdmin,
    USER_ROLE.admin,
    USER_ROLE.user,
  ),
  UserControllers.getMe,
);

export const UserRoutes = router;
