import React from 'react';
import { cn } from '@/lib/utils';



interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export default function LoadingSpinner({
  size = 'md',
  className,
  text,
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div
        className={cn(
          'border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin',
          sizes[size]
        )}
      />
      {text && <p className="mt-3 text-sm text-gray-600">{text}</p>}
    </div>
  );
}
