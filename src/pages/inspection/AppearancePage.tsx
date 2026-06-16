import { useState } from 'react';
import { Eye, AlertTriangle, Image, Plus, CheckCircle, Star } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ChartCard } from '@/components/charts/ChartCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { mockAppearanceRecords } from '@/data/mockData';

const gradeConfig = {
  A: { label: 'A级', desc: '表面光滑平整，无可见缺陷', color: 'text-success', bgColor: 'bg-success/20' },
  B: { label: 'B级', desc: '轻微橘皮纹理，不影响使用', color: 'text-primary-400', bgColor: 'bg-primary-500/20' },
  C: { label: 'C级', desc: '明显橘皮，需评估处理', color: 'text-warning', bgColor: 'bg-warning/20' },
  D: { label: 'D级', desc: '严重缺陷，需返工', color: 'text-danger', bgColor: 'bg-danger/20' },
};

const defectTypes = [
  '橘皮',
  '流挂',
  '针孔',
  '气泡',
  '缩孔',
  '颗粒',
  '色差',
  '漏喷',
];

function AppearancePage() {
  const [selectedGrade, setSelectedGrade] = useState<string>('B');
  const [selectedDefects, setSelectedDefects] = useState<string[]>(['橘皮']);

  const toggleDefect = (defect: string) => {
    setSelectedDefects((prev) =>
      prev.includes(defect) ? prev.filter((d) => d !== defect) : [...prev, defect]
    );
  };

  const gradeStats = [
    { grade: 'A', count: 38, label: 'A级' },
    { grade: 'B', count: 42, label: 'B级' },
    { grade: 'C', count: 15, label: 'C级' },
    { grade: 'D', count: 5, label: 'D级' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="A级率" value={38} unit="%" icon={Star} color="success" />
        <StatCard title="外观合格率" value={95} unit="%" icon={CheckCircle} color="accent" />
        <StatCard title="检测批次" value={mockAppearanceRecords.length} unit="批" icon={Eye} color="primary" />
        <StatCard title="缺陷项次" value={23} unit="项" icon={AlertTriangle} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="外观等级评定" subtitle="橘皮外观检查">
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(gradeConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedGrade(key)}
                  className={`py-4 rounded-lg border transition-all ${
                    selectedGrade === key
                      ? `${config.bgColor} border-current ${config.color}`
                      : 'bg-dark-700/30 border-dark-600/30 text-dark-400 hover:border-dark-500'
                  }`}
                >
                  <p className="text-lg font-bold font-display">{config.label}</p>
                </button>
              ))}
            </div>

            <div className={`p-4 rounded-lg ${gradeConfig[selectedGrade as keyof typeof gradeConfig].bgColor}`}>
              <p className={`text-sm font-medium ${gradeConfig[selectedGrade as keyof typeof gradeConfig].color}`}>
                {gradeConfig[selectedGrade as keyof typeof gradeConfig].desc}
              </p>
            </div>

            <div>
              <p className="text-sm text-dark-300 mb-3">缺陷类型</p>
              <div className="flex flex-wrap gap-2">
                {defectTypes.map((defect) => (
                  <button
                    key={defect}
                    onClick={() => toggleDefect(defect)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                      selectedDefects.includes(defect)
                        ? 'bg-accent-500/20 text-accent-400 border border-accent-500/50'
                        : 'bg-dark-700/50 text-dark-400 border border-dark-600/50 hover:border-dark-500'
                    }`}
                  >
                    {defect}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-dark-300">缺陷描述</label>
              <textarea
                rows={3}
                placeholder="请描述外观缺陷详情..."
                className="input-field mt-2 resize-none"
                defaultValue="表面有轻微橘皮纹理，分布均匀，不影响整体外观质量。"
              />
            </div>

            <div className="flex items-center justify-center p-4 border-2 border-dashed border-dark-600/50 rounded-lg hover:border-primary-500/50 transition-colors cursor-pointer">
              <div className="text-center">
                <Image size={32} className="mx-auto text-dark-500" />
                <p className="text-sm text-dark-400 mt-2">点击上传检测图片</p>
                <p className="text-xs text-dark-500 mt-1">支持 JPG、PNG 格式</p>
              </div>
            </div>

            <button className="btn-accent w-full flex items-center justify-center gap-2">
              <Plus size={16} />
              提交检测结果
            </button>
          </div>
        </ChartCard>

        <div className="space-y-6">
          <ChartCard title="等级分布" subtitle="外观质量等级分布">
            <div className="space-y-3">
              {gradeStats.map((item) => (
                <div key={item.grade}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className={`font-medium ${gradeConfig[item.grade as keyof typeof gradeConfig].color}`}>
                      {item.label}
                    </span>
                    <span className="text-dark-300">{item.count} 批</span>
                  </div>
                  <div className="h-2.5 bg-dark-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.grade === 'A'
                          ? 'bg-success'
                          : item.grade === 'B'
                          ? 'bg-primary-500'
                          : item.grade === 'C'
                          ? 'bg-warning'
                          : 'bg-danger'
                      }`}
                      style={{ width: `${item.count}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="缺陷统计" subtitle="常见缺陷类型分布">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-dark-700/30 rounded-lg text-center">
                <p className="text-2xl font-bold font-display text-accent-400">8</p>
                <p className="text-xs text-dark-400 mt-1">橘皮</p>
              </div>
              <div className="p-3 bg-dark-700/30 rounded-lg text-center">
                <p className="text-2xl font-bold font-display text-primary-400">5</p>
                <p className="text-xs text-dark-400 mt-1">流挂</p>
              </div>
              <div className="p-3 bg-dark-700/30 rounded-lg text-center">
                <p className="text-2xl font-bold font-display text-warning">4</p>
                <p className="text-xs text-dark-400 mt-1">针孔</p>
              </div>
              <div className="p-3 bg-dark-700/30 rounded-lg text-center">
                <p className="text-2xl font-bold font-display text-danger">2</p>
                <p className="text-xs text-dark-400 mt-1">缩孔</p>
              </div>
              <div className="p-3 bg-dark-700/30 rounded-lg text-center">
                <p className="text-2xl font-bold font-display text-info">3</p>
                <p className="text-xs text-dark-400 mt-1">颗粒</p>
              </div>
              <div className="p-3 bg-dark-700/30 rounded-lg text-center">
                <p className="text-2xl font-bold font-display text-success">1</p>
                <p className="text-xs text-dark-400 mt-1">色差</p>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      <ChartCard title="历史记录" subtitle="外观检查记录">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-dark-400 border-b border-dark-700/50">
                <th className="pb-3 font-medium">批次号</th>
                <th className="pb-3 font-medium">等级</th>
                <th className="pb-3 font-medium">缺陷</th>
                <th className="pb-3 font-medium">描述</th>
                <th className="pb-3 font-medium">质检员</th>
                <th className="pb-3 font-medium">检测时间</th>
                <th className="pb-3 font-medium">结果</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {mockAppearanceRecords.map((record) => (
                <tr key={record.id} className="border-b border-dark-700/30 hover:bg-dark-700/20">
                  <td className="py-3 font-medium text-primary-400">{record.batchNo}</td>
                  <td className="py-3">
                    <span className={`font-bold ${gradeConfig[record.grade as keyof typeof gradeConfig].color}`}>
                      {record.grade}级
                    </span>
                  </td>
                  <td className="py-3 text-dark-300">{record.defects.join('、') || '-'}</td>
                  <td className="py-3 text-dark-400 max-w-xs truncate">{record.description}</td>
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

export default AppearancePage;
