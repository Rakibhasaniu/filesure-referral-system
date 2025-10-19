/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from './user.model';

const getMe = async (userId: string, role: string) => {
  const result = await User.findOne({ id: userId });
  return result;
};

const changeStatus = async (id: string, payload: { status: string }) => {
  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

export const UserServices = {
  getMe,
  changeStatus,
};
