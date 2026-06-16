import { cn } from '@/lib/utils';

type StatusType = 
  | 'running' 
  | 'stop' 
  | 'fault' 
  | 'maintenance' 
  | 'warning' 
  | 'pass' 
  | 'fail' 
  | 'pending' 
  | 'available' 
  | 'in-use'
  | 'loading'
  | 'pretreatment'
  | 'spraying'
  | 'curing'
  | 'inspection'
  | 'finished'
  | 'rework'
  | 'stable'
  | 'heating'
  | 'cooling';

interface StatusBadgeProps {
  status: StatusType;
  text?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string; dot: string }> = {
  running: {
    label: '运行中',
    className: 'bg-success/15 text-success',
    dot: 'bg-success animate-pulse',
  },
  stop: {
    label: '已停止',
    className: 'bg-dark-500/30 text-dark-300',
    dot: 'bg-dark-400',
  },
  fault: {
    label: '故障',
    className: 'bg-danger/15 text-danger',
    dot: 'bg-danger animate-pulse',
  },
  maintenance: {
    label: '维护中',
    className: 'bg-warning/15 text-warning',
    dot: 'bg-warning',
  },
  warning: {
    label: '告警',
    className: 'bg-warning/15 text-warning',
    dot: 'bg-warning animate-pulse',
  },
  pass: {
    label: '合格',
    className: 'bg-success/15 text-success',
    dot: 'bg-success',
  },
  fail: {
    label: '不合格',
    className: 'bg-danger/15 text-danger',
    dot: 'bg-danger',
  },
  pending: {
    label: '待检',
    className: 'bg-info/15 text-info',
    dot: 'bg-info',
  },
  available: {
    label: '可用',
    className: 'bg-success/15 text-success',
    dot: 'bg-success',
  },
  'in-use': {
    label: '使用中',
    className: 'bg-primary-500/15 text-primary-400',
    dot: 'bg-primary-500 animate-pulse',
  },
  loading: {
    label: '上件中',
    className: 'bg-primary-500/15 text-primary-400',
    dot: 'bg-primary-500 animate-pulse',
  },
  pretreatment: {
    label: '前处理',
    className: 'bg-info/15 text-info',
    dot: 'bg-info animate-pulse',
  },
  spraying: {
    label: '喷涂中',
    className: 'bg-accent-500/15 text-accent-400',
    dot: 'bg-accent-500 animate-pulse',
  },
  curing: {
    label: '固化中',
    className: 'bg-warning/15 text-warning',
    dot: 'bg-warning animate-pulse',
  },
  inspection: {
    label: '检测中',
    className: 'bg-purple-500/15 text-purple-400',
    dot: 'bg-purple-500 animate-pulse',
  },
  finished: {
    label: '已完成',
    className: 'bg-success/15 text-success',
    dot: 'bg-success',
  },
  rework: {
    label: '返工中',
    className: 'bg-danger/15 text-danger',
    dot: 'bg-danger animate-pulse',
  },
  stable: {
    label: '稳定',
    className: 'bg-success/15 text-success',
    dot: 'bg-success',
  },
  heating: {
    label: '升温中',
    className: 'bg-accent-500/15 text-accent-400',
    dot: 'bg-accent-500 animate-pulse',
  },
  cooling: {
    label: '降温中',
    className: 'bg-info/15 text-info',
    dot: 'bg-info animate-pulse',
  },
};

function StatusBadge({ status, text, size = 'md', className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.stop;
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span className={cn('inline-flex items-center rounded-full font-medium', sizeClasses, config.className, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', size === 'sm' ? 'w-1 h-1' : '', config.dot)} />
      {text || config.label}
    </span>
  );
}

export default StatusBadge;
