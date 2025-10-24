'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { makePurchase, getMyPurchases } from '@/redux/slices/dashboardSlice';
import { getCurrentUser } from '@/redux/slices/authSlice';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navigation from '@/components/layout/Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Badge from '@/components/ui/Badge';
import { formatDateTime, formatCurrency } from '@/lib/utils';


function PurchaseContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { purchases, isLoading, error } = useAppSelector((state) => state.dashboard);
  const { user } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    productName: 'Digital Product',
    amount: '10',
  });

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    dispatch(getMyPurchases());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('Form submitted - preventing default');
    setShowSuccess(false);

    const result = await dispatch(
      makePurchase({
        productName: formData.productName,
        amount: parseFloat(formData.amount),
      })
    );

    console.log('Purchase result:', result);

    if (makePurchase.fulfilled.match(result)) {
      console.log('Purchase successful, updating UI');
      setShowSuccess(true);
 
      dispatch(getCurrentUser());
      dispatch(getMyPurchases());

      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Make a Purchase
          </h1>
          <p className="text-gray-600">
            Simulate a product purchase to earn credits
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Purchase Product</CardTitle>
              </CardHeader>
              <CardContent>
                {showSuccess && (
                  <Alert type="success" className="mb-6">
                    🎉 Purchase successful!
                    {user?.referredBy ? (
                      <>
                        <p>You earned 2 credits!</p>
                        <p className="mt-2">
                          Your referrer also earned 2 credits!
                        </p>
                      </>
                    ) : (
                      <p>Purchase completed successfully.</p>
                    )}
                  </Alert>
                )}

                {error && (
                  <Alert type="error" className="mb-6">
                    {error}
                  </Alert>
                )}

                {!user?.hasPurchased && user?.referredBy && (
                  <Alert type="info" className="mb-6">
                    💡 This is your first purchase! You'll earn 2 credits.
                  </Alert>
                )}

                <form onSubmit={handleSubmit} action="" className="space-y-5">
                  <Input
                    label="Product Name"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    placeholder="Digital Product"
                    disabled={isLoading}
                  />

                  <Input
                    label="Amount (USD)"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="10.00"
                    disabled={isLoading}
                  />

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Purchase Details:
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Product: {formData.productName || 'Digital Product'}</li>
                      <li>• Amount: {formatCurrency(parseFloat(formData.amount) || 0)}</li>
                      <li>
                        • Credits to Earn: {user?.hasPurchased ? '0' : (user?.referredBy ? '2' : '0')} credits
                      </li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    Complete Purchase
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard')}
                  >
                    ← Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Purchase History</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading && !purchases.length ? (
                  <LoadingSpinner size="md" text="Loading purchases..." />
                ) : purchases.length > 0 ? (
                  <div className="space-y-4">
                    {purchases.map((purchase, index) => (
                      <motion.div
                        key={purchase._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {purchase.productName}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {formatDateTime(purchase.createdAt)}
                            </p>
                          </div>
                          {purchase.isFirstPurchase && (
                            <Badge variant="success">
                              First Purchase
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">
                            {formatCurrency(purchase.amount)}
                          </span>
                          {purchase.isFirstPurchase && user?.referredBy && (
                            <span className="text-sm text-green-600 font-medium">
                              +2 Credits Earned
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🛒</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Purchases Yet
                    </h3>
                    <p className="text-gray-600">
                      Make your first purchase to earn credits!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


export default function PurchasePage() {
  return (
    <ProtectedRoute>
      <PurchaseContent />
    </ProtectedRoute>
  );
}
