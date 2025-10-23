'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loginUser, clearError } from '@/redux/slices/authSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';


export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    id: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState<{
    [key: string]: string;
  }>({});

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

 

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    console.log("formdata",formData)
    if (!formData.id.trim()) {
      errors.id = 'User ID or email is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await dispatch(loginUser(formData));

    if (loginUser.fulfilled.match(result)) {
      router.push('/dashboard');
    }
  };



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  console.log("f",formData)


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Welcome Back
            </motion.h1>
            <p className="text-gray-600">Sign in to your FileSure account</p>
          </div>

          {error && (
            <Alert type="error" className="mb-6" onClose={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="User ID or Email"
              name="id"
              value={formData.id}
              onChange={handleChange}
              placeholder="U-000001 or email@example.com"
              error={formErrors.id}
              disabled={isLoading}
              required
            />

            <div>
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                error={formErrors.password}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm text-blue-600 hover:text-blue-700 mt-1.5 font-medium"
              >
                {showPassword ? 'Hide' : 'Show'} password
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <div className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Create one
              </Link>
            </div>
          </div>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
