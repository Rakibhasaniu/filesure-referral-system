'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getDashboardStats } from '@/redux/slices/dashboardSlice';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navigation from '@/components/layout/Navigation';
import StatCard from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { copyToClipboard, generateReferralLink, formatDateTime } from '@/lib/utils';


function DashboardContent() {
  const dispatch = useAppDispatch();
  const { stats, isLoading, error } = useAppSelector((state) => state.dashboard);
  const { user } = useAppSelector((state) => state.auth);

  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    dispatch(getDashboardStats());
  }, [dispatch]);

  const handleCopyLink = async () => {
    if (user?.referralCode) {
      const link = generateReferralLink(user.referralCode);
      const success = await copyToClipboard(link);
      if (success) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      }
    }
  };

  const handleCopyCode = async () => {
    if (user?.referralCode) {
      const success = await copyToClipboard(user.referralCode);
      if (success) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Referral Dashboard
          </h1>
          <p className="text-gray-600">
            Track your referrals and earnings
          </p>
        </motion.div>

        {copySuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert type="success">
              Copied to clipboard successfully!
            </Alert>
          </motion.div>
        )}

        {error && (
          <Alert type="error" className="mb-6">
            {error}
          </Alert>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <StatCard
            icon="👥"
            label="Total Referred Users"
            value={stats?.totalReferredUsers || 0}
            iconColor="text-blue-600"
          />
          <StatCard
            icon="✅"
            label="Converted Users"
            value={stats?.convertedUsers || 0}
            iconColor="text-green-600"
          />
          <StatCard
            icon="💰"
            label="Total Credits Earned"
            value={stats?.totalCreditsEarned || 0}
            iconColor="text-purple-600"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referral Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={stats?.referralLink || ''}
                    readOnly
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                  />
                  <Button onClick={handleCopyLink}>
                    Copy Link
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referral Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={user?.referralCode || ''}
                    readOnly
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-lg"
                  />
                  <Button onClick={handleCopyCode}>
                    Copy Code
                  </Button>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                💡 Share this link or code with friends. You'll earn 2 credits when they make their first purchase!
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Referral History</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.referrals && stats.referrals.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          User
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          User ID
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.referrals.map((referral, index) => (
                        <motion.tr
                          key={referral._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {referral?.referred?.email}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                            {referral.referred?.id}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                referral.status === 'converted'
                                  ? 'success'
                                  : 'warning'
                              }
                            >
                              {referral.status === 'converted' ? '✓ Converted' : '⏳ Pending'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDateTime(referral.createdAt)}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Referrals Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start sharing your referral link to earn credits!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}


export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
