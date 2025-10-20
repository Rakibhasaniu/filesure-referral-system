import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import type {
  DashboardState,
  ReferralStats,
  Purchase,
  PurchaseData,
  ApiResponse,
  PurchaseResponse,
} from '@/types';



const initialState: DashboardState = {
  stats: null,
  purchases: [],
  isLoading: false,
  error: null,
};



export const getDashboardStats = createAsyncThunk(
  'dashboard/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<ReferralStats>>('/dashboard/stats');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const makePurchase = createAsyncThunk(
  'dashboard/makePurchase',
  async (purchaseData: PurchaseData, { rejectWithValue }) => {
    try {
      const response = await api.post<PurchaseResponse>('/purchases', purchaseData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const getMyPurchases = createAsyncThunk(
  'dashboard/getMyPurchases',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<Purchase[]>>('/purchases/my-purchases');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);



const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
    resetDashboard: (state) => {
      state.stats = null;
      state.purchases = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(makePurchase.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(makePurchase.fulfilled, (state, action) => {
        state.isLoading = false;
        state.purchases.unshift(action.payload);
      })
      .addCase(makePurchase.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getMyPurchases.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyPurchases.fulfilled, (state, action) => {
        state.isLoading = false;
        state.purchases = action.payload;
      })
      .addCase(getMyPurchases.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboardError, resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
