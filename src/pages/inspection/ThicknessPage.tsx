import { useState } from 'react';
import { Ruler, Target, CheckCircle2, XCircle, Plus, TrendingUp } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ChartCard, CustomTooltip } from '@/components/charts/ChartCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import StatusBadge from '@/components/ui/StatusBadge';
import { mockThicknessRecords, generateThicknessTrendData } from '@/data/mockData';

function ThicknessPage() {
  const [selectedRecord, setSelectedRecord] = useState(mockThicknessRecords[0]);
  const [trendData] = useState(generateThicknessTrendData());

  const detectionPoints = [
    { id: 1, label: '左上', value: 85 },
    { id: 2, label: '中上', value: 92 },
    { id: 3, label: '右上', value: 88 },
    { id: 4, label: '左中', value: 90 },
    { id: 5, label: '中心', value: 87 },
    { id: 6, label: '右中', value: 95 },
    { id: 7, label: '左下', value: 89 },
    { id: 8, label: '中下', value: 91 },
    { id: 9, label: '右下', value: 86 },
  ];

  const getPointColor = (value: number) => {
    const target = selectedRecord.target;
    const tolerance = selectedRecord.tolerance;
    if (Math.abs(value - target) <= tolerance) return 'bg-success';
    if (Math.abs(value - target) <= tolerance * 1.5) return 'bg-warning';
    return 'bg-danger';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="平均膜厚" value={selectedRecord.average} unit="μm" icon={Ruler} color="accent" />
        <StatCard title="目标膜厚" value={selectedRecord.target} unit="μm" icon={Target} color="primary" />
        <StatCard title="合格率" value={87.5} unit="%" icon={CheckCircle2} color="success" />
        <StatCard title="检测批次" value={mockThicknessRecords.length} unit="批" icon={TrendingUp} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="检测点位" subtitle="9点检测法">
          <div className="py-6">
            <div className="w-full aspect-square max-w-xs mx-auto bg-dark-700/30 rounded-lg relative p-4">
              <div className="grid grid-cols-3 gap-2 h-full">
                {detectionPoints.map((point) => (
                  <div
                    key={point.id}
                    className="flex flex-col items-center justify-center bg-dark-800/50 rounded-lg border border-dark-600/50 hover:border-primary-500/30 transition-colors cursor-pointer"
                  >
                    <div className={`w-8 h-8 rounded-full ${getPointColor(point.value)} flex items-center justify-center text-white text-xs font-bold`}>
                      {point.value}
                    </div>
                    <span className="text-xs text-dark-400 mt-1">{point.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-success" />
                <span className="text-xs text-dark-400">合格</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-warning" />
                <span className="text-xs text-dark-400">偏差</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-danger" />
                <span className="text-xs text-dark-400">不合格</span>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="膜厚分布" subtitle="各检测点膜厚数据">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={detectionPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" stroke="#66758F" fontSize={10} />
                <YAxis stroke="#66758F" fontSize={11} domain={[70, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="膜厚μm" fill="#286FCC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <div className="space-y-6">
          <ChartCard title="检测结果" subtitle={`批次: ${selectedRecord.batchNo}`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
                <span className="text-sm text-dark-300">最小值</span>
                <span className="text-lg font-bold font-display text-warning">{selectedRecord.min} μm</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
                <span className="text-sm text-dark-300">最大值</span>
                <span className="text-lg font-bold font-display text-accent-400">{selectedRecord.max} μm</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
                <span className="text-sm text-dark-300">平均值</span>
                <span className="text-lg font-bold font-display text-success">{selectedRecord.average} μm</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
                <span className="text-sm text-dark-300">公差范围</span>
                <span className="text-lg font-bold font-display text-primary-400">±{selectedRecord.tolerance} μm</span>
              </div>
              <div className="pt-3 border-t border-dark-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-300">检测结果</span>
                  <StatusBadge status={selectedRecord.result as any} />
                </div>
              </div>
            </div>
          </ChartCard>

          <button className="btn-accent w-full flex items-center justify-center gap-2 py-3">
            <Plus size={18} />
            新增检测记录
          </button>
        </div>
      </div>

      <ChartCard title="膜厚趋势" subtitle="近10天平均膜厚趋势">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#66758F" fontSize={11} />
              <YAxis stroke="#66758F" fontSize={11} domain={[70, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="target" name="目标" stroke="#10B981" strokeWidth={1} strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="thickness" name="实际" stroke="#FF6B35" strokeWidth={2} dot={{ fill: '#FF6B35', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="历史记录" subtitle="膜厚检测记录">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-dark-400 border-b border-dark-700/50">
                <th className="pb-3 font-medium">批次号</th>
                <th className="pb-3 font-medium">平均值</th>
                <th className="pb-3 font-medium">最小值</th>
                <th className="pb-3 font-medium">最大值</th>
                <th className="pb-3 font-medium">目标值</th>
                <th className="pb-3 font-medium">质检员</th>
                <th className="pb-3 font-medium">检测时间</th>
                <th className="pb-3 font-medium">结果</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {mockThicknessRecords.map((record) => (
                <tr
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className="border-b border-dark-700/30 hover:bg-dark-700/20 cursor-pointer transition-colors"
                >
                  <td className="py-3 font-medium text-primary-400">{record.batchNo}</td>
                  <td className="py-3 text-dark-200">{record.average} μm</td>
                  <td className="py-3 text-dark-200">{record.min} μm</td>
                  <td className="py-3 text-dark-200">{record.max} μm</td>
                  <td className="py-3 text-dark-200">{record.target} μm</td>
                  <td className="py-3 text-dark-300">{record.inspector}</td>
                  <td className="py-3 text-dark-400">{record.time}</td>
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

export default ThicknessPage;
