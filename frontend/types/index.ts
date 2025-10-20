
export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'superAdmin';
  status: 'in-progress' | 'blocked';
  referralCode: string;
  referredBy?: string;
  credits: number;
  hasPurchased: boolean;
  createdAt: string;
  updatedAt: string;
}



export interface LoginCredentials {
  id: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: User;
  };
}



export interface ReferralStats {
  totalReferredUsers: number;
  convertedUsers: number;
  totalCreditsEarned: number;
  referralLink: string;
  referralCode: string;
  referrals: Referral[];
}

export interface Referral {
  _id: string;
  referrer: string;
  referred: {
    _id: string;
    email: string;
    id: string;
  };
  status: 'pending' | 'converted';
  creditAwarded: boolean;
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
}


export interface Purchase {
  _id: string;
  user: string;
  productName: string;
  amount: number;
  isFirstPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseData {
  productName?: string;
  amount?: number;
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  data: Purchase;
}



export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    limit: number;
    page: number;
    total: number;
    totalPage: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errorSources?: Array<{
    path: string;
    message: string;
  }>;
  stack?: string;
}



export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface DashboardState {
  stats: ReferralStats | null;
  purchases: Purchase[];
  isLoading: boolean;
  error: string | null;
}
