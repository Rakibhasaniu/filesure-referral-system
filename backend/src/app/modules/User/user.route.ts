/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';

import { USER_ROLE } from './user.constant';
import { UserControllers } from './user.controller';

const router = express.Router();




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
