/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import config from '../../config';
import AppError from '../../errors/AppError';
import { User } from '../User/user.model';
import { Referral } from '../Referral/referral.model';
import { TDashboardStats } from './dashboard.interface';

const getDashboardStats = async (userId: string): Promise<TDashboardStats> => {
  // Find the current user by custom id
  const user = await User.findOne({ id: userId });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Find all referrals where this user is the referrer
  const referrals = await Referral.find({ referrer: user._id })
    .populate('referred', 'id name email createdAt')
    .sort({ createdAt: -1 });

  // Calculate total referred users
  const totalReferredUsers = referrals.length;

  // Calculate converted users (those who made a purchase)
  const convertedUsers = referrals.filter(
    (ref) => ref.status === 'converted',
  ).length;

  const totalCreditsEarned = convertedUsers * 2;

  const frontendUrl = config.frontend_url || 'http://localhost:3000';
  const referralLink = `${frontendUrl}/register?r=${user.referralCode}`;

  const referralDetails = referrals.map((ref) => ({
    name: (ref.referred as any).name || 'Unknown',
    userName: (ref.referred as any).id || 'Unknown',
    email: (ref.referred as any).email || 'Unknown',
    status: ref.status,
    joinedAt: ref.createdAt,
    convertedAt: ref.convertedAt,
  }));

  return {
    totalReferredUsers,
    convertedUsers,
    totalCreditsEarned,
    referralLink,
    referralCode: user.referralCode,
    referrals: referralDetails,
  };
};

export const DashboardServices = {
  getDashboardStats,
};
