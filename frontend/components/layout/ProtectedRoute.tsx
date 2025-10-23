'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getCurrentUser } from '@/redux/slices/authSlice';
import LoadingSpinner from '@/components/ui/LoadingSpinner';



export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user } = useAppSelector(
    (state) => state.auth
  );
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = Cookies.get('accessToken');

    if (!token) {
      router.replace('/login');
      return;
    }

    if (!user && !isLoading) {
      dispatch(getCurrentUser());
    }

    setChecking(false);
  }, [dispatch, router, user, isLoading]);

  useEffect(() => {
    const token = Cookies.get('accessToken');

    if (!checking && !isLoading && !isAuthenticated && !token) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router, checking]);

  if (checking || isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return <>{children}</>;
}
