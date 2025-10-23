'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logoutUser } from '@/redux/slices/authSlice';
import Button from '@/components/ui/Button';



export default function Navigation() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/login');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white shadow-md sticky top-0 z-50"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              FileSure
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Dashboard
            </Link>
            <Link
              href="/purchase"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Purchase
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-900">
                  {user.email}
                </span>
                <span className="text-xs text-gray-500">{user.id}</span>
                <span className="text-xs font-semibold text-blue-600">
                  💰 {user.credits} Credits
                </span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
