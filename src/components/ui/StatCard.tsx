import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  trend?: number;
  trendLabel?: string;
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

function StatCard({ title, value, unit, icon: Icon, trend, trendLabel, color = 'primary', className }: StatCardProps) {
  const colorClasses = {
    primary: 'from-primary-500/20 to-primary-500/5 text-primary-400 border-primary-500/30',
    accent: 'from-accent-500/20 to-accent-500/5 text-accent-400 border-accent-500/30',
    success: 'from-success/20 to-success/5 text-success border-success/30',
    warning: 'from-warning/20 to-warning/5 text-warning border-warning/30',
    danger: 'from-danger/20 to-danger/5 text-danger border-danger/30',
    info: 'from-info/20 to-info/5 text-info border-info/30',
  };

  return (
    <div className={cn(
      'card p-5 relative overflow-hidden card-hover',
      className
    )}>
      <div className={cn('absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-50',
        color === 'primary' ? 'bg-primary-500/20' :
        color === 'accent' ? 'bg-accent-500/20' :
        color === 'success' ? 'bg-success/20' :
        color === 'warning' ? 'bg-warning/20' :
        color === 'info' ? 'bg-info/20' :
        'bg-danger/20'
      )} />
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-dark-400">{title}</p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="stat-value">{value}</span>
              {unit && <span className="text-sm text-dark-400">{unit}</span>}
            </div>
          </div>
          {Icon && (
            <div className={cn(
              'p-3 rounded-lg bg-gradient-to-br border',
              colorClasses[color]
            )}>
              <Icon size={24} />
            </div>
          )}
        </div>

        {(trend !== undefined || trendLabel) && (
          <div className="mt-3 pt-3 border-t border-dark-700/50 flex items-center gap-2">
            {trend !== undefined && (
              <span className={cn(
                'inline-flex items-center gap-1 text-xs font-medium',
                trend >= 0 ? 'text-success' : 'text-danger'
              )}>
                {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(trend)}%
              </span>
            )}
            {trendLabel && <span className="text-xs text-dark-500">{trendLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
