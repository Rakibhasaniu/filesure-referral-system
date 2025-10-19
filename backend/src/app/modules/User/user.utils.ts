import { User } from './user.model';

const findLastUserId = async () => {
  const lastUser = await User.findOne(
    {
      role: 'user',
    },
    {
      id: 1,
      _id: 0,
    },
  )
    .sort({
      createdAt: -1,
    })
    .lean();

  return lastUser?.id ? lastUser.id.substring(2) : undefined;
};

export const generateUserId = async () => {
  let currentId = (0).toString();
  const lastUserId = await findLastUserId();

  if (lastUserId) {
    currentId = lastUserId;
  }

  const incrementId = (Number(currentId) + 1).toString().padStart(6, '0');

  return `U-${incrementId}`;
};

// Generate unique referral code (e.g., LINA123, RYAN456)
export const generateReferralCode = (name: string): string => {
  // Take first 4 letters of name (uppercase) and add 3 random digits
  const namePart = name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X');
  const numberPart = Math.floor(100 + Math.random() * 900); // 3 digit random number
  return `${namePart}${numberPart}`;
};
