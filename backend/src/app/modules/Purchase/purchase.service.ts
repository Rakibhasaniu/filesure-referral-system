import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
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

    // Find the user
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Check if this is the first purchase
    const isFirstPurchase = !user.hasPurchased;

    // Create the purchase
    const purchase = await Purchase.create(
      [
        {
          user: userId,
          productName: payload.productName || 'Digital Product',
          amount: payload.amount || 10,
          isFirstPurchase,
        },
      ],
      { session },
    );

    // If this is the first purchase, award credits
    if (isFirstPurchase) {
      // Update user's hasPurchased status and add 2 credits to the buyer
      await User.findByIdAndUpdate(
        userId,
        {
          hasPurchased: true,
          $inc: { credits: 2 },
        },
        { session },
      );

      // If user was referred, award credits to referrer
      if (user.referredBy) {
        const referrer = await User.findOne({
          referralCode: user.referredBy,
        }).session(session);

        if (referrer) {
          // Award 2 credits to referrer
          await User.findByIdAndUpdate(
            referrer._id,
            {
              $inc: { credits: 2 },
            },
            { session },
          );

          // Update referral status
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

    return purchase[0];
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    throw err;
  }
};

const getUserPurchasesFromDB = async (userId: string) => {
  const purchases = await Purchase.find({ user: userId }).sort({
    createdAt: -1,
  });
  return purchases;
};

export const PurchaseServices = {
  makePurchaseIntoDB,
  getUserPurchasesFromDB,
};
