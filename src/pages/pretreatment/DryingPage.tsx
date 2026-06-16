import { useState } from 'react';
import { Thermometer, Clock, Droplets, Wind } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ChartCard } from '@/components/charts/ChartCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { mockDryingRecords } from '@/data/mockData';

function DryingPage() {
  const [dryingParams] = useState({
    washCount: 3,
    dryingTemp: 125,
    dryingTime: 20,
    currentStep: 'drying',
  });

  const steps = [
    { key: 'wash1', label: '一级水洗', status: 'completed' },
    { key: 'wash2', label: '二级水洗', status: 'completed' },
    { key: 'wash3', label: '三级水洗', status: 'completed' },
    { key: 'drying', label: '烘干', status: 'running' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="水洗次数" value={dryingParams.washCount} unit="次" icon={Droplets} color="primary" />
        <StatCard title="烘干温度" value={dryingParams.dryingTemp} unit="℃" icon={Thermometer} color="accent" />
        <StatCard title="烘干时间" value={dryingParams.dryingTime} unit="分钟" icon={Clock} color="success" />
        <StatCard title="今日批次" value={mockDryingRecords.length} unit="批" icon={Wind} color="warning" />
      </div>

      <ChartCard title="工艺流程" subtitle="水洗烘干工序进度">
        <div className="py-6">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      step.status === 'running'
                        ? 'border-accent-500 bg-accent-500/20 text-accent-400 shadow-glow-accent'
                        : step.status === 'completed'
                        ? 'border-success bg-success/20 text-success'
                        : 'border-dark-600 bg-dark-700/30 text-dark-400'
                    }`}
                  >
                    {step.status === 'running' ? (
                      <Clock size={20} className="animate-pulse" />
                    ) : step.status === 'completed' ? (
                      <span className="font-bold">✓</span>
                    ) : (
                      <span className="font-medium">{index + 1}</span>
                    )}
                  </div>
                  <p className={`mt-2 text-sm font-medium ${
                    step.status === 'running'
                      ? 'text-accent-400'
                      : step.status === 'completed'
                      ? 'text-success'
                      : 'text-dark-400'
                  }`}>
                    {step.label}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-20 h-1 mx-2 rounded-full ${
                    step.status === 'completed' ? 'bg-success' : 'bg-dark-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="烘干炉参数" subtitle="当前烘干工艺参数">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-dark-700/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer size={18} className="text-accent-400" />
                <span className="text-sm text-dark-300">设定温度</span>
              </div>
              <p className="text-2xl font-bold font-display text-white">120 <span className="text-sm text-dark-400">℃</span></p>
            </div>
            <div className="p-4 bg-dark-700/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={18} className="text-primary-400" />
                <span className="text-sm text-dark-300">设定时间</span>
              </div>
              <p className="text-2xl font-bold font-display text-white">20 <span className="text-sm text-dark-400">分钟</span></p>
            </div>
            <div className="p-4 bg-dark-700/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wind size={18} className="text-success" />
                <span className="text-sm text-dark-300">风速</span>
              </div>
              <p className="text-2xl font-bold font-display text-white">3.5 <span className="text-sm text-dark-400">m/s</span></p>
            </div>
            <div className="p-4 bg-dark-700/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Droplets size={18} className="text-info" />
                <span className="text-sm text-dark-300">含水量</span>
              </div>
              <p className="text-2xl font-bold font-display text-success">0.5 <span className="text-sm text-dark-400">%</span></p>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="设备状态" subtitle="水洗烘干设备">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm text-dark-200">一级水洗槽</span>
              </div>
              <StatusBadge status="running" size="sm" />
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm text-dark-200">二级水洗槽</span>
              </div>
              <StatusBadge status="running" size="sm" />
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm text-dark-200">三级水洗槽</span>
              </div>
              <StatusBadge status="running" size="sm" />
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm text-dark-200">烘干炉</span>
              </div>
              <StatusBadge status="running" size="sm" />
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <span className="text-sm text-dark-200">循环风机</span>
              </div>
              <span className="text-xs text-warning">需保养</span>
            </div>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="历史记录" subtitle="水洗烘干记录">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-dark-400 border-b border-dark-700/50">
                <th className="pb-3 font-medium">批次号</th>
                <th className="pb-3 font-medium">水洗次数</th>
                <th className="pb-3 font-medium">烘干温度</th>
                <th className="pb-3 font-medium">烘干时间</th>
                <th className="pb-3 font-medium">操作员</th>
                <th className="pb-3 font-medium">开始时间</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {mockDryingRecords.map((record) => (
                <tr key={record.id} className="border-b border-dark-700/30 hover:bg-dark-700/20">
                  <td className="py-3 font-medium text-primary-400">{record.batchNo}</td>
                  <td className="py-3 text-dark-200">{record.washCount}次</td>
                  <td className="py-3 text-dark-200">{record.temperature}℃</td>
                  <td className="py-3 text-dark-200">{record.time}分钟</td>
                  <td className="py-3 text-dark-300">{record.operator}</td>
                  <td className="py-3 text-dark-400">{record.startTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

export default DryingPage;
