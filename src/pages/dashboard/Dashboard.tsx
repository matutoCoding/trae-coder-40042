import { useEffect, useState } from 'react';
import {
  Package,
  CheckCircle2,
  Cog,
  Clock,
  AlertTriangle,
  TrendingUp,
  Activity,
  BarChart3,
  Zap,
} from 'lucide-react';
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
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import {
  mockDashboardStats,
  mockBatches,
  mockAlarms,
  generateProductionTrendData,
  generateWasteGasData,
} from '@/data/mockData';
import StatusBadge from '@/components/ui/StatusBadge';
import { cn } from '@/lib/utils';

function Dashboard() {
  const [productionData, setProductionData] = useState<any[]>([]);
  const [wasteGasData, setWasteGasData] = useState<any[]>([]);

  useEffect(() => {
    setProductionData(generateProductionTrendData());
    setWasteGasData(generateWasteGasData().slice(-12));
  }, []);

  const processSteps = [
    { name: '上件挂具', count: 12, status: 'running', color: 'text-primary-400' },
    { name: '前处理', count: 8, status: 'running', color: 'text-info' },
    { name: '喷粉喷漆', count: 6, status: 'running', color: 'text-accent-400' },
    { name: '流平固化', count: 5, status: 'running', color: 'text-warning' },
    { name: '膜厚检测', count: 4, status: 'running', color: 'text-success' },
    { name: '下件包装', count: 3, status: 'running', color: 'text-dark-300' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <StatCard
          title="今日产量"
          value={mockDashboardStats.todayOutput}
          unit="件"
          icon={Package}
          trend={8.5}
          trendLabel="较昨日"
          color="primary"
        />
        <StatCard
          title="合格率"
          value={mockDashboardStats.passRate}
          unit="%"
          icon={CheckCircle2}
          trend={1.2}
          trendLabel="较上周"
          color="success"
        />
        <StatCard
          title="运行设备"
          value={`${mockDashboardStats.runningEquipment}/${mockDashboardStats.totalEquipment}`}
          unit="台"
          icon={Cog}
          trend={0}
          trendLabel="设备利用率 80%"
          color="accent"
        />
        <StatCard
          title="在制批次"
          value={mockDashboardStats.inProgressBatches}
          unit="批"
          icon={Activity}
          color="warning"
        />
        <StatCard
          title="待检批次"
          value={mockDashboardStats.pendingInspection}
          unit="批"
          icon={Clock}
          color="info"
        />
        <StatCard
          title="告警信息"
          value={mockAlarms.filter((a) => !a.resolved).length}
          unit="条"
          icon={AlertTriangle}
          color="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ChartCard
            title="产量趋势"
            subtitle="近7天生产产量统计"
            action={
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-dark-400">
                  <span className="w-2 h-2 rounded-full bg-primary-500" />
                  总产量
                </span>
                <span className="flex items-center gap-1.5 text-xs text-dark-400">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  合格数
                </span>
              </div>
            }
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productionData}>
                  <defs>
                    <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#286FCC" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#286FCC" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPass" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#66758F" fontSize={12} />
                  <YAxis stroke="#66758F" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="output" name="总产量" stroke="#286FCC" strokeWidth={2} fill="url(#colorOutput)" />
                  <Area type="monotone" dataKey="pass" name="合格数" stroke="#10B981" strokeWidth={2} fill="url(#colorPass)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard title="工序在制统计" subtitle="各工序当前在制数量">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processSteps} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" stroke="#66758F" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#66758F" fontSize={11} width={70} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="数量" fill="#FF6B35" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="设备状态概览" subtitle="当前设备运行情况">
              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="text-center">
                  <div className="relative">
                    <Zap size={36} className="mx-auto text-success" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse" />
                  </div>
                  <p className="mt-2 text-2xl font-bold font-display text-white">12</p>
                  <p className="text-xs text-dark-400">运行中</p>
                </div>
                <div className="text-center">
                  <div className="relative">
                    <Cog size={36} className="mx-auto text-warning" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full" />
                  </div>
                  <p className="mt-2 text-2xl font-bold font-display text-white">2</p>
                  <p className="text-xs text-dark-400">待机中</p>
                </div>
                <div className="text-center">
                  <div className="relative">
                    <AlertTriangle size={36} className="mx-auto text-danger" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full animate-pulse" />
                  </div>
                  <p className="mt-2 text-2xl font-bold font-display text-white">1</p>
                  <p className="text-xs text-dark-400">故障</p>
                </div>
              </div>
              <div className="pt-3 border-t border-dark-700/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dark-400">设备利用率</span>
                  <span className="text-white font-medium">80%</span>
                </div>
                <div className="mt-2 h-2 bg-dark-700/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" style={{ width: '80%' }} />
                </div>
              </div>
            </ChartCard>
          </div>
        </div>

        <div className="space-y-6">
          <ChartCard title="在制批次" subtitle="当前进行中的批次">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {mockBatches.slice(0, 4).map((batch, index) => (
                <div
                  key={batch.id}
                  className={cn(
                    'p-3 rounded-lg bg-dark-700/30 border border-dark-600/30 hover:border-primary-500/30 transition-all cursor-pointer',
                    index === 0 && 'animate-slide-up'
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{batch.batchNo}</p>
                      <p className="text-xs text-dark-400 mt-0.5">{batch.workpieceName}</p>
                    </div>
                    <StatusBadge status={batch.status as any} size="sm" />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-dark-400">
                    <span>数量: {batch.quantity}件</span>
                    <span>{batch.operator}</span>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="VOC排放趋势" subtitle="近12小时监测数据">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={wasteGasData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#66758F" fontSize={11} />
                  <YAxis stroke="#66758F" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="voc" name="VOC(mg/m³)" stroke="#FF6B35" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 pt-3 border-t border-dark-700/50 flex items-center justify-between">
              <span className="text-xs text-dark-400">排放标准限值</span>
              <span className="text-sm text-success font-medium">50 mg/m³</span>
            </div>
          </ChartCard>

          <ChartCard title="告警信息" subtitle="最新未处理告警">
            <div className="space-y-3 max-h-56 overflow-y-auto">
              {mockAlarms.filter((a) => !a.resolved).map((alarm, index) => (
                <div
                  key={alarm.id}
                  className={cn(
                    'p-3 rounded-lg border-l-4 bg-dark-700/20',
                    alarm.type === 'danger'
                      ? 'border-danger bg-danger/5'
                      : alarm.type === 'warning'
                      ? 'border-warning bg-warning/5'
                      : 'border-info bg-info/5'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      size={16}
                      className={cn(
                        'mt-0.5 flex-shrink-0',
                        alarm.type === 'danger'
                          ? 'text-danger'
                          : alarm.type === 'warning'
                          ? 'text-warning'
                          : 'text-info'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{alarm.title}</p>
                      <p className="text-xs text-dark-400 mt-1 line-clamp-2">{alarm.content}</p>
                      <p className="text-xs text-dark-500 mt-2">{alarm.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
