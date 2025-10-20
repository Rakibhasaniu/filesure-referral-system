import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import {
  sendFirstPurchaseEmail,
  sendReferralConversionNotification,
} from '../../services/emailService';
import { User } from '../User/user.model';
import { Referral } from '../Referral/referral.model';
import { Purchase } from './purchase.model';
import { TPurchase } from './purchase.interface';

const makePurchaseIntoDB = async (
  userId: string,
  payload: Partial<TPurchase>,
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const user = await User.findOne({ id: userId }).session(session);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    const isFirstPurchase = !user.hasPurchased;

    const purchase = await Purchase.create(
      [
        {
          user: user._id,
          productName: payload.productName || 'Digital Product',
          amount: payload.amount || 10,
          isFirstPurchase,
        },
      ],
      { session },
    );


    if (isFirstPurchase) {
      // Update user's hasPurchased status and add 2 credits to the buyer
      await User.findByIdAndUpdate(
        user._id,
        {
          hasPurchased: true,
          $inc: { credits: 2 },
        },
        { session },
      );

      if (user.referredBy) {
        const referrer = await User.findOne({
          referralCode: user.referredBy,
        }).session(session);

        if (referrer) {
          await User.findByIdAndUpdate(
            referrer._id,
            {
              $inc: { credits: 2 },
            },
            { session },
          );

          await Referral.findOneAndUpdate(
            { referrer: referrer._id, referred: user._id },
            {
              status: 'converted',
              creditAwarded: true,
              convertedAt: new Date(),
            },
            { session },
          );
        }
      }
    }

    await session.commitTransaction();
    await session.endSession();


    if (isFirstPurchase) {
      const updatedUser = await User.findOne({ id: userId });

      if (updatedUser) {
        sendFirstPurchaseEmail(
          updatedUser.email,
          updatedUser.id,
          2,
          updatedUser.credits,
        );

        if (user.referredBy) {
          const referrer = await User.findOne({
            referralCode: user.referredBy,
          });

          if (referrer) {
            sendReferralConversionNotification(
              referrer.email,
              referrer.id,
              updatedUser.email,
              2,
            );
          }
        }
      }
    }

    return purchase[0];
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    throw err;
  }
};

const getUserPurchasesFromDB = async (userId: string) => {
  const user = await User.findOne({ id: userId });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const purchases = await Purchase.find({ user: user._id }).sort({
    createdAt: -1,
  });
  return purchases;
};

export const PurchaseServices = {
  makePurchaseIntoDB,
  getUserPurchasesFromDB,
};
