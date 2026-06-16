import { useState, useEffect } from 'react';
import { Thermometer, Clock, Beaker, FlaskConical } from 'lucide-react';
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
} from 'recharts';
import StatusBadge from '@/components/ui/StatusBadge';
import { mockPhosphatingRecords } from '@/data/mockData';

function generatePhosData() {
  const data = [];
  for (let i = 20; i >= 0; i--) {
    const minutes = i;
    data.push({
      time: `${minutes}分前`,
      temperature: 40 + Math.random() * 4,
      ph: 3 + Math.random() * 0.4,
      filmWeight: 2.3 + Math.random() * 0.4,
    });
  }
  return data.reverse();
}

function PhosphatingPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    setData(generatePhosData());
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="槽液温度" value={41.8} unit="℃" icon={Thermometer} color="accent" />
        <StatCard title="处理时间" value={8} unit="分钟" icon={Clock} color="primary" />
        <StatCard title="PH值" value={3.2} unit="" icon={Beaker} color="success" />
        <StatCard title="皮膜重量" value={2.5} unit="g/m²" icon={FlaskConical} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="温度曲线" subtitle="磷化槽温度监控">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="phosTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#286FCC" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#286FCC" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#66758F" fontSize={11} />
                <YAxis stroke="#66758F" fontSize={11} domain={[38, 45]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="temperature" name="温度℃" stroke="#286FCC" strokeWidth={2} fill="url(#phosTemp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="PH值趋势" subtitle="磷化液PH值监控">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#66758F" fontSize={11} />
                <YAxis stroke="#66758F" fontSize={11} domain={[2.5, 3.8]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="ph" name="PH值" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="工艺参数" subtitle="磷化工艺配置">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
              <span className="text-sm text-dark-300">温度范围</span>
              <span className="text-sm text-white font-medium">40 - 45 ℃</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
              <span className="text-sm text-dark-300">处理时间</span>
              <span className="text-sm text-white font-medium">6 - 10 分钟</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
              <span className="text-sm text-dark-300">PH值范围</span>
              <span className="text-sm text-white font-medium">3.0 - 3.5</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
              <span className="text-sm text-dark-300">总酸度</span>
              <span className="text-sm text-white font-medium">20 - 26 点</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
              <span className="text-sm text-dark-300">游离酸度</span>
              <span className="text-sm text-white font-medium">1.0 - 1.8 点</span>
            </div>
          </div>
        </ChartCard>

        <div className="lg:col-span-2">
          <ChartCard title="历史记录" subtitle="磷化处理记录">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-dark-400 border-b border-dark-700/50">
                    <th className="pb-3 font-medium">批次号</th>
                    <th className="pb-3 font-medium">温度</th>
                    <th className="pb-3 font-medium">时间</th>
                    <th className="pb-3 font-medium">PH值</th>
                    <th className="pb-3 font-medium">皮膜重</th>
                    <th className="pb-3 font-medium">结果</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {mockPhosphatingRecords.map((record) => (
                    <tr key={record.id} className="border-b border-dark-700/30 hover:bg-dark-700/20">
                      <td className="py-3 font-medium text-primary-400">{record.batchNo}</td>
                      <td className="py-3 text-dark-200">{record.temperature}℃</td>
                      <td className="py-3 text-dark-200">{record.time}分</td>
                      <td className="py-3 text-dark-200">{record.ph}</td>
                      <td className="py-3 text-dark-200">{record.filmWeight}g/m²</td>
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
      </div>
    </div>
  );
}

export default PhosphatingPage;
