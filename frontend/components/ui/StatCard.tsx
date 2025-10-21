import React from 'react';
import { Card, CardContent } from './Card';
import { cn } from '@/lib/utils';


interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  iconColor?: string;
  className?: string;
}

export default function StatCard({
  icon,
  label,
  value,
  iconColor = 'text-blue-600',
  className,
}: StatCardProps) {
  return (
    <Card className={cn('hover:shadow-xl transition-shadow duration-200', className)}>
      <CardContent className="flex items-center space-x-4">
        <div className={cn('text-4xl', iconColor)}>{icon}</div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
