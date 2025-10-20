import express from 'express';
import auth from '../../middlewares/auth';
import { dashboardLimiter } from '../../middlewares/rateLimiter';
import { USER_ROLE } from '../User/user.constant';
import { DashboardControllers } from './dashboard.controller';

const router = express.Router();

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get user's referral dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
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
 *                   example: Dashboard statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalReferredUsers:
 *                       type: number
 *                       example: 10
 *                       description: Total number of users who signed up with your referral code
 *                     convertedUsers:
 *                       type: number
 *                       example: 4
 *                       description: Number of referred users who made a purchase
 *                     totalCreditsEarned:
 *                       type: number
 *                       example: 8
 *                       description: Total credits earned from referrals and purchases
 *                     referralLink:
 *                       type: string
 *                       example: http://localhost:3000/register?r=RAKI365
 *                       description: Your unique referral link to share
 *                     referralCode:
 *                       type: string
 *                       example: RAKI365
 *                       description: Your unique referral code
 *                     referrals:
 *                       type: array
 *                       description: List of all users you referred
 *                       items:
 *                         type: object
 *                         properties:
 *                           userName:
 *                             type: string
 *                             example: U-000003
 *                           email:
 *                             type: string
 *                             example: sohag@example.com
 *                           status:
 *                             type: string
 *                             enum: [pending, converted]
 *                             example: converted
 *                           joinedAt:
 *                             type: string
 *                             format: date-time
 *                           convertedAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get(
  '/stats',
  dashboardLimiter,
  auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin),
  DashboardControllers.getDashboardStats,
);

export const DashboardRoutes = router;
