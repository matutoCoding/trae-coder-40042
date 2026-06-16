import { useState, useEffect } from 'react';
import { Thermometer, Clock, Flame, TrendingUp } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ChartCard, CustomTooltip } from '@/components/charts/ChartCard';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import StatusBadge from '@/components/ui/StatusBadge';
import { mockOvenZones, generateOvenTempData } from '@/data/mockData';

function OvenPage() {
  const [tempData, setTempData] = useState<any[]>([]);
  const [zones] = useState(mockOvenZones);

  useEffect(() => {
    setTempData(generateOvenTempData());
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="最高温度" value={182} unit="℃" icon={Thermometer} color="accent" />
        <StatCard title="保温时间" value={25} unit="分钟" icon={Clock} color="primary" />
        <StatCard title="升温速率" value={3.2} unit="℃/min" icon={TrendingUp} color="success" />
        <StatCard title="运行状态" value="正常" unit="" icon={Flame} color="warning" />
      </div>

      <ChartCard
        title="炉温曲线"
        subtitle="固化炉温度实时监控"
        action={
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-dark-400">
              <span className="w-3 h-1 bg-accent-500 rounded" />
              实际温度
            </div>
            <div className="flex items-center gap-1.5 text-xs text-dark-400">
              <span className="w-3 h-1 bg-success rounded" />
              设定温度
            </div>
          </div>
        }
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tempData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="#66758F" fontSize={11} />
              <YAxis stroke="#66758F" fontSize={11} domain={[100, 200]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                name="实际温度"
                stroke="#FF6B35"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, fill: '#FF6B35' }}
              />
              <Line
                type="monotone"
                dataKey={() => 180}
                name="设定温度"
                stroke="#10B981"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {zones.map((zone, index) => (
          <div
            key={zone.id}
            className="card p-5 hover:border-primary-500/30 transition-all"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-dark-200">{zone.name}</h4>
              <StatusBadge
                status={zone.status === 'stable' ? 'running' : zone.status === 'heating' ? 'warning' : 'stop'}
                text={zone.status === 'stable' ? '稳定' : zone.status === 'heating' ? '升温' : '降温'}
                size="sm"
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-display text-white">{zone.temperature}</span>
              <span className="text-sm text-dark-400">℃</span>
            </div>
            <div className="mt-3 pt-3 border-t border-dark-700/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-dark-400">设定值</span>
                <span className="text-dark-200">{zone.targetTemp} ℃</span>
              </div>
              <div className="mt-2 h-1.5 bg-dark-700/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    zone.status === 'stable' ? 'bg-success' : zone.status === 'heating' ? 'bg-accent-500' : 'bg-primary-500'
                  }`}
                  style={{ width: `${Math.min((zone.temperature / 200) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="工艺参数" subtitle="固化炉参数配置">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
              <span className="text-sm text-dark-300">固化温度</span>
              <span className="text-sm text-white font-medium">180 ± 5 ℃</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
              <span className="text-sm text-dark-300">保温时间</span>
              <span className="text-sm text-white font-medium">20 - 30 分钟</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
              <span className="text-sm text-dark-300">升温速率</span>
              <span className="text-sm text-white font-medium">≥ 3 ℃/min</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
              <span className="text-sm text-dark-300">炉内风速</span>
              <span className="text-sm text-white font-medium">2 - 3 m/s</span>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="能耗统计" subtitle="今日能耗情况">
          <div className="h-48 bg-dark-700/20 rounded-lg flex items-center justify-center text-dark-500">
            图表区域 - 能耗统计图表
          </div>
        </ChartCard>

        <ChartCard title="设备状态" subtitle="固化炉设备">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm text-dark-200">加热系统</span>
              </div>
              <span className="text-xs text-success">正常</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm text-dark-200">循环风机</span>
              </div>
              <span className="text-xs text-success">正常</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm text-dark-200">输送系统</span>
              </div>
              <span className="text-xs text-success">正常</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <span className="text-sm text-dark-200">排气系统</span>
              </div>
              <span className="text-xs text-warning">待维护</span>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

export default OvenPage;
