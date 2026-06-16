import { useState, useEffect } from 'react';
import { Thermometer, Clock, Droplets, Play, Pause, Settings } from 'lucide-react';
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
  Area,
  AreaChart,
} from 'recharts';
import StatusBadge from '@/components/ui/StatusBadge';
import { mockDegreasingRecords } from '@/data/mockData';

function generateTempData() {
  const data = [];
  for (let i = 30; i >= 0; i--) {
    const minutes = i;
    data.push({
      time: `${minutes}分前`,
      temperature: 52 + Math.random() * 6,
      target: 55,
    });
  }
  return data.reverse();
}

function DegreasingPage() {
  const [isRunning, setIsRunning] = useState(true);
  const [tempData, setTempData] = useState<any[]>([]);
  const [params, setParams] = useState({
    temperature: 54.5,
    time: 12,
    concentration: 8.5,
  });

  useEffect(() => {
    setTempData(generateTempData());
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="当前温度" value={params.temperature.toFixed(1)} unit="℃" icon={Thermometer} color="accent" trend={0.5} trendLabel="目标 55℃" />
        <StatCard title="处理时间" value={params.time} unit="分钟" icon={Clock} color="primary" />
        <StatCard title="药液浓度" value={params.concentration} unit="%" icon={Droplets} color="success" />
        <StatCard title="今日批次" value={mockDegreasingRecords.length} unit="批" icon={Clock} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="温度曲线"
            subtitle="脱脂槽温度实时监控"
            action={
              <div className="flex items-center gap-3">
                <StatusBadge status={isRunning ? 'running' : 'stop'} text={isRunning ? '运行中' : '已停止'} />
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`p-2 rounded-lg transition-colors ${
                    isRunning
                      ? 'bg-danger/20 text-danger hover:bg-danger/30'
                      : 'bg-success/20 text-success hover:bg-success/30'
                  }`}
                >
                  {isRunning ? <Pause size={18} /> : <Play size={18} />}
                </button>
              </div>
            }
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tempData}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#66758F" fontSize={11} />
                  <YAxis stroke="#66758F" fontSize={11} domain={[45, 60]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="target" name="目标温度" stroke="#10B981" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                  <Area type="monotone" dataKey="temperature" name="实际温度" stroke="#FF6B35" strokeWidth={2} fill="url(#tempGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div className="space-y-6">
          <ChartCard title="参数设置" subtitle="脱脂工艺参数配置">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-dark-300">目标温度 (℃)</label>
                <input
                  type="number"
                  value={55}
                  className="input-field mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm text-dark-300">处理时间 (分钟)</label>
                <input
                  type="number"
                  value={12}
                  className="input-field mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm text-dark-300">目标浓度 (%)</label>
                <input
                  type="number"
                  value={8.5}
                  step={0.1}
                  className="input-field mt-1.5"
                />
              </div>
              <button className="btn-primary w-full flex items-center justify-center gap-2">
                <Settings size={16} />
                应用参数
              </button>
            </div>
          </ChartCard>

          <ChartCard title="设备状态" subtitle="脱脂槽设备运行情况">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm text-dark-200">加热系统</span>
                </div>
                <span className="text-xs text-success">正常</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm text-dark-200">循环泵</span>
                </div>
                <span className="text-xs text-success">正常</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-warning" />
                  <span className="text-sm text-dark-200">过滤系统</span>
                </div>
                <span className="text-xs text-warning">滤芯寿命 60%</span>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      <ChartCard title="历史记录" subtitle="脱脂处理记录">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-dark-400 border-b border-dark-700/50">
                <th className="pb-3 font-medium">批次号</th>
                <th className="pb-3 font-medium">温度</th>
                <th className="pb-3 font-medium">时间</th>
                <th className="pb-3 font-medium">浓度</th>
                <th className="pb-3 font-medium">操作员</th>
                <th className="pb-3 font-medium">开始时间</th>
                <th className="pb-3 font-medium">结果</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {mockDegreasingRecords.map((record) => (
                <tr key={record.id} className="border-b border-dark-700/30 hover:bg-dark-700/20 transition-colors">
                  <td className="py-3 font-medium text-primary-400">{record.batchNo}</td>
                  <td className="py-3 text-dark-200">{record.temperature}℃</td>
                  <td className="py-3 text-dark-200">{record.time}分钟</td>
                  <td className="py-3 text-dark-200">{record.concentration}%</td>
                  <td className="py-3 text-dark-300">{record.operator}</td>
                  <td className="py-3 text-dark-400">{record.startTime}</td>
                  <td className="py-3">
                    <StatusBadge status={record.result} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

export default DegreasingPage;
