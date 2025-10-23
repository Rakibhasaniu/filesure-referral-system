import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import jwt, { JwtPayload} from 'jsonwebtoken';
import mongoose from 'mongoose';
import config from '../../config';
import AppError from '../../errors/AppError';
import { sendEmail } from '../../utils/sendEmail';
import {
  sendWelcomeEmail,
  sendReferralSignupNotification,
} from '../../services/emailService';
import { User } from '../User/user.model';
import { Referral } from '../Referral/referral.model';
import { generateUserId, generateReferralCode } from '../User/user.utils';
import { TLoginUser, TRegisterUser } from './auth.interface';
import { createToken, verifyToken } from './auth.utils';

const registerUser = async (payload: TRegisterUser) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const existingUser = await User.findOne({ email: payload.email }).session(
      session,
    );
    if (existingUser) {
      throw new AppError(httpStatus.CONFLICT, 'Email already registered');
    }

    const userId = await generateUserId();
    const userReferralCode = generateReferralCode(payload.name);

    let referrer = null;
    if (payload.referralCode) {
      referrer = await User.findOne({
        referralCode: payload.referralCode,
      }).session(session);

      if (!referrer) {
        throw new AppError(httpStatus.NOT_FOUND, 'Invalid referral code');
      }
    }

    const newUser = await User.create(
      [
        {
          id: userId,
          name: payload.name,
          email: payload.email,
          password: payload.password,
          role: 'user',
          referralCode: userReferralCode,
          referredBy: payload.referralCode || undefined,
        },
      ],
      { session },
    );

    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create user');
    }


    if (referrer) {
      await Referral.create(
        [
          {
            referrer: referrer._id,
            referred: newUser[0]._id,
            status: 'pending',
          },
        ],
        { session },
      );
    }

    await session.commitTransaction();
    await session.endSession();

    const frontendUrl = config.frontend_url || 'http://localhost:3000';
    const referralLink = `${frontendUrl}/register?r=${newUser[0].referralCode}`;

    sendWelcomeEmail(
      newUser[0].email,
      payload.name,
      newUser[0].referralCode,
      referralLink,
    );

    if (referrer) {
      sendReferralSignupNotification(
        referrer.email,
        referrer.id,
        payload.name,
        newUser[0].email,
      );
    }

    const jwtPayload = {
      userId: newUser[0].id,
      role: newUser[0].role,
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as string,
    );

    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      config.jwt_refresh_expires_in as string,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
        referralCode: newUser[0].referralCode,
      },
    };
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    throw err;
  }
};

const loginUser = async (payload: TLoginUser) => {
  const user = await User.isUserExistsByEmailOrId(payload.id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }

  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }


  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }


  if (!(await User.isPasswordMatched(payload?.password, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');


  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
    needsPasswordChange: user?.needsPasswordChange,
  };
};

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {
  const user = await User.isUserExistsByCustomId(userData.userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }

  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }


  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }


  if (!(await User.isPasswordMatched(payload.oldPassword, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');

  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
      id: userData.userId,
      role: userData.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
    },
  );

  return null;
};

const refreshToken = async (token: string) => {
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);

  const { userId, iat } = decoded;

  const user = await User.isUserExistsByCustomId(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  if (
    user.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number)
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized !');
  }

  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    accessToken,
  };
};

const forgetPassword = async (userId: string) => {
  const user = await User.isUserExistsByCustomId(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };

  const resetToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    '10m',
  );

  const resetUILink = `${config.reset_pass_ui_link}?id=${user.id}&token=${resetToken} `;

  sendEmail(user.email, resetUILink);

  console.log(resetUILink);
};

const resetPassword = async (
  payload: { id: string; newPassword: string },
  token: string,
) => {
  const user = await User.isUserExistsByCustomId(payload?.id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  const decoded = jwt.verify(
    token,
    config.jwt_access_secret as string,
  ) as JwtPayload;


  if (payload.id !== decoded.userId) {
    console.log(payload.id, decoded.userId);
    throw new AppError(httpStatus.FORBIDDEN, 'You are forbidden!');
  }

  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
      id: decoded.userId,
      role: decoded.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
    },
  );
};

export const AuthServices = {
  registerUser,
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
};
