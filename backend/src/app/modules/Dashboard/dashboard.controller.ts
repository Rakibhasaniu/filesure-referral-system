import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DashboardServices } from './dashboard.service';

const getDashboardStats = catchAsync(async (req, res) => {
  const { userId } = req.user;

  const result = await DashboardServices.getDashboardStats(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard statistics retrieved successfully',
    data: result,
  });
});

export const DashboardControllers = {
  getDashboardStats,
};
