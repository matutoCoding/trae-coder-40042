import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function ChartCard({ title, subtitle, children, className, action }: ChartCardProps) {
  return (
    <div className={cn('card p-5', className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-dark-100 font-display">{title}</h3>
          {subtitle && <p className="text-xs text-dark-400 mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number | string; color: string }[];
  label?: string;
}

export function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-800/95 backdrop-blur-sm border border-dark-600 rounded-lg p-3 shadow-xl">
        <p className="text-sm text-dark-300 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-dark-300">{entry.name}:</span>
            <span className="text-white font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

interface GaugeChartProps {
  value: number;
  max: number;
  label: string;
  unit?: string;
  color?: string;
  warningThreshold?: number;
  dangerThreshold?: number;
}

export function GaugeChart({ value, max, label, unit = '', color = '#10B981', warningThreshold, dangerThreshold }: GaugeChartProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  let barColor = color;
  if (dangerThreshold && value >= dangerThreshold) {
    barColor = '#EF4444';
  } else if (warningThreshold && value >= warningThreshold) {
    barColor = '#F59E0B';
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-14 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full rounded-t-full border-8 border-dark-700/50 border-b-0" />
        <div
          className="absolute bottom-0 left-0 w-full h-full rounded-t-full border-8 border-b-0 transition-all duration-700"
          style={{
            borderColor: barColor,
            clipPath: `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`,
          }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="text-2xl font-bold font-display text-white">{value}</span>
          {unit && <span className="text-xs text-dark-400">{unit}</span>}
        </div>
      </div>
      <p className="text-sm text-dark-300 mt-2">{label}</p>
    </div>
  );
}

export { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart };
