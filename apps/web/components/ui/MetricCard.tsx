import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import Card from './Card';

export interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'border-l-4 border-neutral-300',
    primary: 'border-l-4 border-primary-500',
    secondary: 'border-l-4 border-secondary-500',
    accent: 'border-l-4 border-accent-500',
  };

  const iconColors = {
    default: 'text-neutral-400',
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    accent: 'text-accent-500',
  };

  return (
    <Card className={variantStyles[variant]}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 uppercase tracking-wide mb-2">
            {label}
          </p>
          <p className="text-3xl font-bold text-neutral-900 mb-2">{value}</p>
          {trend && (
            <div className="flex items-center gap-1">
              {trend.direction === 'up' ? (
                <TrendingUp className="w-4 h-4 text-secondary-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  trend.direction === 'up' ? 'text-secondary-600' : 'text-red-600'
                }`}
              >
                {Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-neutral-500">vs last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="flex-shrink-0">
            <Icon className={`w-8 h-8 ${iconColors[variant]}`} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;
