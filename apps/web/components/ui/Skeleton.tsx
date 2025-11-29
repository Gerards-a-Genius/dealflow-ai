import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export default function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const baseClass = 'animate-pulse bg-neutral-200';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%'),
  };

  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`${baseClass} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  ));

  if (count === 1) return skeletons[0];

  return <div className="space-y-2">{skeletons}</div>;
}

// Pre-built skeleton patterns
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-card p-6 space-y-4">
      <Skeleton height={24} width="60%" />
      <Skeleton height={16} count={3} />
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }, (_, i) => (
        <td key={i} className="px-4 py-4">
          <Skeleton height={20} width={i === 0 ? '80%' : '60%'} />
        </td>
      ))}
    </tr>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-card p-6 border-l-4 border-neutral-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton height={14} width="40%" />
          <Skeleton height={36} width="60%" />
          <Skeleton height={16} width="80%" />
        </div>
        <Skeleton variant="circular" width={32} height={32} />
      </div>
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton height={16} width="40%" />
        <Skeleton height={14} width="60%" />
      </div>
      <Skeleton height={24} width={80} />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton height={32} width={200} />
          <Skeleton height={20} width={300} />
        </div>
        <Skeleton height={40} width={120} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }, (_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CardSkeleton />
        </div>
        <CardSkeleton />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      {/* Header */}
      <div className="bg-neutral-50 px-4 py-3 border-b">
        <div className="flex gap-4">
          {Array.from({ length: columns }, (_, i) => (
            <Skeleton key={i} height={14} width={`${80 + Math.random() * 40}px`} />
          ))}
        </div>
      </div>
      {/* Rows */}
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="px-4 py-4 flex gap-4">
            {Array.from({ length: columns }, (_, j) => (
              <Skeleton key={j} height={20} width={`${60 + Math.random() * 60}px`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
