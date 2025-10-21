import React from 'react';
import { cn } from '@/lib/utils';


interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

export default function Alert({
  type = 'info',
  children,
  className,
  onClose,
}: AlertProps) {
  const styles = {
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div
      className={cn(
        'flex items-start p-4 rounded-lg border-l-4 animate-slide-down',
        styles[type],
        className
      )}
      role="alert"
    >
      <span className="text-2xl mr-3 flex-shrink-0">{icons[type]}</span>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close alert"
        >
          ✕
        </button>
      )}
    </div>
  );
}
