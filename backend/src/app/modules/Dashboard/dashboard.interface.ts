export interface TDashboardStats {
  totalReferredUsers: number;
  convertedUsers: number;
  totalCreditsEarned: number;
  referralLink: string;
  referralCode: string;
  referrals: {
    userName: string;
    email: string;
    status: 'pending' | 'converted';
    joinedAt?: Date;
    convertedAt?: Date;
  }[];
}
