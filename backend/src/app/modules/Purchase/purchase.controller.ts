import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PurchaseServices } from './purchase.service';

const makePurchase = catchAsync(async (req, res) => {
  const { userId } = req.user;

  const result = await PurchaseServices.makePurchaseIntoDB(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Purchase completed successfully!',
    data: result,
  });
});

const getMyPurchases = catchAsync(async (req, res) => {
  const { userId } = req.user;

  const result = await PurchaseServices.getUserPurchasesFromDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Purchases retrieved successfully',
    data: result,
  });
});

export const PurchaseControllers = {
  makePurchase,
  getMyPurchases,
};
