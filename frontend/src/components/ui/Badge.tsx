'use client';

import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
  {
    variants: {
      variant: {
        default: 'bg-gray-800 text-gray-300 border-gray-700',
        success: 'bg-green-500/20 text-green-400 border-green-500/50',
        warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
        danger: 'bg-red-500/20 text-red-400 border-red-500/50',
        info: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
        orange: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, variant, className }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      {children}
    </span>
  );
}

export function RiskBadge({ level }: { level: string }) {
  const variant =
    level === 'LOW'
      ? 'success'
      : level === 'MODERATE'
      ? 'warning'
      : level === 'HIGH'
      ? 'orange'
      : 'danger';

  return (
    <Badge variant={variant} className="text-sm px-3 py-1">
      {level} RISK
    </Badge>
  );
}
