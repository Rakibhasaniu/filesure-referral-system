import { Schema, model } from 'mongoose';
import { TPurchase } from './purchase.interface';

const purchaseSchema = new Schema<TPurchase>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    isFirstPurchase: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Purchase = model<TPurchase>('Purchase', purchaseSchema);
