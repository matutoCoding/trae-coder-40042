import { useState, useEffect, useMemo } from 'react';
import { Thermometer, Clock, Droplets, Wind, Play, CheckCircle, XCircle, User, Settings } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ChartCard } from '@/components/charts/ChartCard';
import StatusBadge from '@/components/ui/StatusBadge';
import BatchSelector from '@/components/ui/BatchSelector';
import { useProductionStore } from '@/store/productionStore';
import { mockDryingRecords } from '@/data/mockData';

const STEP = 'drying' as const;

function DryingPage() {
  const {
    currentBatchId,
    getCurrentBatch,
    startProcess,
    completeProcess,
    getProcessRecord,
    dryingRecords,
  } = useProductionStore();

  const currentBatch = getCurrentBatch();
  const stepRecord = currentBatchId ? getProcessRecord(currentBatchId, STEP) : null;
  const batchRecords = currentBatchId
    ? dryingRecords.filter(r => r.batchId === currentBatchId)
    : [];
  const displayRecords = batchRecords.length > 0 ? batchRecords : mockDryingRecords;

  const [params, setParams] = useState({
    washCount: 3,
    dryingTemp: 125,
    dryingTime: 20,
  });
  const [operator, setOperator] = useState(currentBatch?.operator ?? '');
  const [note, setNote] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const steps = [
    { key: 'wash1', label: '一级水洗', status: 'completed' },
    { key: 'wash2', label: '二级水洗', status: 'completed' },
    { key: 'wash3', label: '三级水洗', status: 'completed' },
    { key: 'drying', label: '烘干', status: stepRecord?.status || 'pending' },
  ];

  useEffect(() => {
    if (currentBatch?.operator) {
      setOperator(currentBatch.operator);
    }
  }, [currentBatch?.operator]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 2500);
  };

  const handleStartProcess = () => {
    if (!currentBatchId) {
      showToast('error', '请先选择批次');
      return;
    }
    if (stepRecord?.status === 'running' || stepRecord?.status === 'completed') {
      showToast('error', '当前工序已开始或已完成');
      return;
    }
    startProcess(currentBatchId, STEP, operator);
    showToast('success', '水洗烘干工序已开始');
  };

  const handleCompleteProcess = () => {
    if (!currentBatchId) {
      showToast('error', '请先选择批次');
      return;
    }
    if (stepRecord?.status !== 'running') {
      showToast('error', '当前工序未在进行中');
      return;
    }
    const paramsSummary = `水洗${params.washCount}次 烘干温度${params.dryingTemp}℃ 烘干时间${params.dryingTime}分钟`;
    const finalNote = note ? `${note} | ${paramsSummary}` : paramsSummary;
    completeProcess(currentBatchId, STEP, 'pass', finalNote);
    showToast('success', '水洗烘干工序登记完成');
    setNote('');
  };

  const progressPercent = useMemo(() => {
    if (!stepRecord) return 0;
    if (stepRecord.status === 'completed') return 100;
    if (stepRecord.status === 'running') {
      const start = stepRecord.startTime ? new Date(stepRecord.startTime).getTime() : Date.now();
      const elapsed = (Date.now() - start) / 60000;
      return Math.min((elapsed / params.dryingTime) * 100, 95);
    }
    return 0;
  }, [stepRecord, params.dryingTime]);

  return (
    <div className="space-y-6">
      <BatchSelector requiredStep={STEP} />

      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] card px-5 py-3 flex items-center gap-2.5 animate-slide-up ${
            toast.type === 'success' ? 'border-success/40 text-success' : 'border-danger/40 text-danger'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span className="text-sm">{toast.msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="水洗次数" value={params.washCount} unit="次" icon={Droplets} color="primary" />
        <StatCard title="烘干温度" value={params.dryingTemp} unit="℃" icon={Thermometer} color="accent" />
        <StatCard title="烘干时间" value={params.dryingTime} unit="分钟" icon={Clock} color="success" />
        <StatCard title="本批次记录" value={batchRecords.length} unit="条" icon={Wind} color="warning" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="烘干炉参数" subtitle="当前烘干工艺参数">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-dark-700/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer size={18} className="text-accent-400" />
                    <span className="text-sm text-dark-300">设定温度</span>
                  </div>
                  <p className="text-2xl font-bold font-display text-white">{params.dryingTemp} <span className="text-sm text-dark-400">℃</span></p>
                </div>
                <div className="p-4 bg-dark-700/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={18} className="text-primary-400" />
                    <span className="text-sm text-dark-300">设定时间</span>
                  </div>
                  <p className="text-2xl font-bold font-display text-white">{params.dryingTime} <span className="text-sm text-dark-400">分钟</span></p>
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
                  <StatusBadge status={stepRecord?.status === 'running' ? 'running' : 'pending'} size="sm" />
                </div>
              </div>
            </ChartCard>
          </div>

          <ChartCard title="历史记录" subtitle={currentBatchId ? `批次 ${currentBatch?.batchNo} 水洗烘干记录` : '水洗烘干记录'}>
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
                  {displayRecords.map((record) => (
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

        <div className="space-y-6">
          <ChartCard title="工序状态" subtitle="水洗烘干工序进度">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-400">状态</span>
                <StatusBadge
                  status={stepRecord?.status === 'completed' ? 'pass' : stepRecord?.status === 'running' ? 'running' : 'pending'}
                  text={stepRecord?.status === 'completed' ? '已完成' : stepRecord?.status === 'running' ? '进行中' : '待开始'}
                  size="sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-400">操作员</span>
                <span className="text-sm text-dark-200 flex items-center gap-1">
                  <User size={14} />
                  {stepRecord?.operator || operator || '--'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-400">开始时间</span>
                <span className="text-sm text-dark-200">
                  {stepRecord?.startTime
                    ? new Date(stepRecord.startTime).toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    : '--'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-400">结束时间</span>
                <span className="text-sm text-dark-200">
                  {stepRecord?.endTime
                    ? new Date(stepRecord.endTime).toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    : '--'}
                </span>
              </div>
              {stepRecord?.note && (
                <div className="pt-2 border-t border-dark-700/50">
                  <span className="text-xs text-dark-400">备注</span>
                  <p className="text-xs text-dark-300 mt-1">{stepRecord.note}</p>
                </div>
              )}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-dark-400">工序进度</span>
                  <span className="text-dark-200">{progressPercent.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-dark-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="参数设置" subtitle="水洗烘干工艺参数">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-dark-300">操作员</label>
                <input
                  type="text"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="input-field mt-1.5"
                  placeholder="输入操作员姓名"
                />
              </div>
              <div>
                <label className="text-sm text-dark-300">水洗次数</label>
                <input
                  type="number"
                  value={params.washCount}
                  onChange={(e) => setParams({ ...params, washCount: Number(e.target.value) })}
                  className="input-field mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm text-dark-300">烘干温度 (℃)</label>
                <input
                  type="number"
                  value={params.dryingTemp}
                  onChange={(e) => setParams({ ...params, dryingTemp: Number(e.target.value) })}
                  className="input-field mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm text-dark-300">烘干时间 (分钟)</label>
                <input
                  type="number"
                  value={params.dryingTime}
                  onChange={(e) => setParams({ ...params, dryingTime: Number(e.target.value) })}
                  className="input-field mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm text-dark-300">备注</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="input-field mt-1.5 resize-none"
                  placeholder="输入备注信息..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleStartProcess}
                  disabled={!currentBatchId || stepRecord?.status === 'running' || stepRecord?.status === 'completed'}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play size={16} />
                  开始工序
                </button>
                <button
                  onClick={handleCompleteProcess}
                  disabled={!currentBatchId || stepRecord?.status !== 'running'}
                  className="btn-outline flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Settings size={16} />
                  完成本工序登记
                </button>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

export default DryingPage;
