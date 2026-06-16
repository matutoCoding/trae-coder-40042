import { useState } from 'react';
import { Grid3X3, Shield, CheckCircle, Plus, TrendingUp } from 'lucide-react';
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
} from 'recharts';
import StatusBadge from '@/components/ui/StatusBadge';
import { mockAdhesionRecords } from '@/data/mockData';

const gradeDescriptions: Record<number, { label: string; desc: string; color: string }> = {
  0: { label: '0级', desc: '切口边缘完全光滑，无任何脱落', color: 'text-success' },
  1: { label: '1级', desc: '切口交叉处有少许涂层脱落，不影响使用', color: 'text-success' },
  2: { label: '2级', desc: '切口边缘和交叉处有涂层脱落，面积小于5%', color: 'text-warning' },
  3: { label: '3级', desc: '切口边缘有部分涂层脱落，面积5%-15%', color: 'text-warning' },
  4: { label: '4级', desc: '涂层大片脱落，面积15%-35%', color: 'text-danger' },
  5: { label: '5级', desc: '涂层严重脱落，面积大于35%', color: 'text-danger' },
};

function AdhesionPage() {
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [testPosition, setTestPosition] = useState('正面中心');

  const gradeStats = [
    { grade: '0级', count: 45, percentage: 45 },
    { grade: '1级', count: 35, percentage: 35 },
    { grade: '2级', count: 15, percentage: 15 },
    { grade: '3级', count: 3, percentage: 3 },
    { grade: '4级', count: 2, percentage: 2 },
    { grade: '5级', count: 0, percentage: 0 },
  ];

  const positions = [
    '正面中心',
    '正面左上角',
    '正面右上角',
    '侧面边缘',
    '底部中心',
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="平均等级" value="1.2" unit="级" icon={Shield} color="success" />
        <StatCard title="合格率" value={95.6} unit="%" icon={CheckCircle} color="accent" />
        <StatCard title="检测批次" value={mockAdhesionRecords.length} unit="批" icon={Grid3X3} color="primary" />
        <StatCard title="0级率" value={45} unit="%" icon={TrendingUp} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="划格测试" subtitle="百格法附着力测试">
          <div className="py-4">
            <div className="w-48 h-48 mx-auto bg-dark-700/30 rounded-lg relative flex items-center justify-center">
              <div className="w-32 h-32 relative">
                <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 gap-0.5">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className={`border border-dark-500/50 ${
                        selectedGrade >= 1 && i === 12
                          ? 'bg-accent-500/20'
                          : selectedGrade >= 2 && (i < 5 || i % 5 === 0 || i % 5 === 4 || i >= 20)
                          ? 'bg-warning/10'
                          : selectedGrade >= 3 && (i < 10 || i % 5 < 2 || i % 5 > 2 || i >= 15)
                          ? 'bg-danger/10'
                          : 'bg-dark-800/50'
                      }`}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-3xl font-bold font-display ${gradeDescriptions[selectedGrade].color}`}>
                    {gradeDescriptions[selectedGrade].label}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className={`text-sm font-medium ${gradeDescriptions[selectedGrade].color}`}>
                {gradeDescriptions[selectedGrade].desc}
              </p>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="等级分布" subtitle="各等级批次分布">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="grade" stroke="#66758F" fontSize={11} />
                <YAxis stroke="#66758F" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="批次数量" fill="#286FCC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <div className="space-y-6">
          <ChartCard title="检测录入" subtitle="新增附着力检测">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-dark-300">检测等级</label>
                <div className="grid grid-cols-6 gap-1 mt-2">
                  {[0, 1, 2, 3, 4, 5].map((grade) => (
                    <button
                      key={grade}
                      onClick={() => setSelectedGrade(grade)}
                      className={`py-2 rounded text-sm font-medium transition-all ${
                        selectedGrade === grade
                          ? 'bg-primary-500 text-white'
                          : 'bg-dark-700/50 text-dark-300 hover:bg-dark-700'
                      }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-dark-300">检测位置</label>
                <select
                  value={testPosition}
                  onChange={(e) => setTestPosition(e.target.value)}
                  className="input-field mt-2"
                >
                  {positions.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-dark-300">备注</label>
                <textarea
                  placeholder="输入检测备注..."
                  rows={3}
                  className="input-field mt-2 resize-none"
                />
              </div>
              <button className="btn-accent w-full flex items-center justify-center gap-2">
                <Plus size={16} />
                提交检测
              </button>
            </div>
          </ChartCard>
        </div>
      </div>

      <ChartCard title="历史记录" subtitle="附着力检测记录">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-dark-400 border-b border-dark-700/50">
                <th className="pb-3 font-medium">批次号</th>
                <th className="pb-3 font-medium">等级</th>
                <th className="pb-3 font-medium">检测位置</th>
                <th className="pb-3 font-medium">质检员</th>
                <th className="pb-3 font-medium">检测时间</th>
                <th className="pb-3 font-medium">结果</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {mockAdhesionRecords.map((record) => (
                <tr key={record.id} className="border-b border-dark-700/30 hover:bg-dark-700/20">
                  <td className="py-3 font-medium text-primary-400">{record.batchNo}</td>
                  <td className="py-3">
                    <span className={`font-bold ${
                      record.grade <= 1 ? 'text-success' : record.grade <= 2 ? 'text-warning' : 'text-danger'
                    }`}>
                      {record.grade} 级
                    </span>
                  </td>
                  <td className="py-3 text-dark-300">{record.position}</td>
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

export default AdhesionPage;
