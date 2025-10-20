import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { purchaseLimiter } from '../../middlewares/rateLimiter';
import { USER_ROLE } from '../User/user.constant';
import { PurchaseControllers } from './purchase.controller';
import { PurchaseValidation } from './purchase.validation';

const router = express.Router();

/**
 * @swagger
 * /purchases:
 *   post:
 *     summary: Make a purchase (First purchase awards credits)
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *                 example: Premium Resume Template Bundle
 *                 default: Digital Template
 *               amount:
 *                 type: number
 *                 example: 15
 *                 default: 10
 *     responses:
 *       201:
 *         description: Purchase completed successfully
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
 *                   example: Purchase completed successfully!
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     user:
 *                       type: string
 *                     productName:
 *                       type: string
 *                       example: Premium Resume Template Bundle
 *                     amount:
 *                       type: number
 *                       example: 15
 *                     isFirstPurchase:
 *                       type: boolean
 *                       example: true
 *                       description: If true, 2 credits awarded to buyer and referrer
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.post(
  '/',
  purchaseLimiter,
  auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin),
  validateRequest(PurchaseValidation.makePurchaseValidationSchema),
  PurchaseControllers.makePurchase,
);

/**
 * @swagger
 * /purchases/my-purchases:
 *   get:
 *     summary: Get current user's purchase history
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Purchases retrieved successfully
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
 *                   example: Purchases retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       productName:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       isFirstPurchase:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get(
  '/my-purchases',
  auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin),
  PurchaseControllers.getMyPurchases,
);

export const PurchaseRoutes = router;
