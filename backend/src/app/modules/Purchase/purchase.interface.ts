import { Types } from 'mongoose';

export interface TPurchase {
  user: Types.ObjectId;
  productName: string;
  amount: number;
  isFirstPurchase: boolean;
}
