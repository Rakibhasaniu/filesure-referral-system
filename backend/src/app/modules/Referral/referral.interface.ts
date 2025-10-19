import { Types } from 'mongoose';

export interface TReferral {
  referrer: Types.ObjectId;
  referred: Types.ObjectId;
  status: 'pending' | 'converted';
  creditAwarded: boolean;
  convertedAt?: Date;
}
