import { Schema, model } from 'mongoose';
import { TReferral } from './referral.interface';

const referralSchema = new Schema<TReferral>(
  {
    referrer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    referred: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'converted'],
      default: 'pending',
    },
    creditAwarded: {
      type: Boolean,
      default: false,
    },
    convertedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Ensure unique referral tracking
referralSchema.index({ referrer: 1, referred: 1 }, { unique: true });

export const Referral = model<TReferral>('Referral', referralSchema);
