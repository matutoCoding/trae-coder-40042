import { useState, useEffect, useMemo } from 'react';
import { Thermometer, Clock, Droplets, Play, CheckCircle, XCircle, User, Settings } from 'lucide-react';
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
import BatchSelector from '@/components/ui/BatchSelector';
import { useProductionStore } from '@/store/productionStore';
import { mockDegreasingRecords } from '@/data/mockData';

const STEP = 'degreasing' as const;

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
  const {
    currentBatchId,
    getCurrentBatch,
    startProcess,
    completeProcess,
    getProcessRecord,
    degreasingRecords,
  } = useProductionStore();

  const currentBatch = getCurrentBatch();
  const stepRecord = currentBatchId ? getProcessRecord(currentBatchId, STEP) : null;
  const batchRecords = currentBatchId
    ? degreasingRecords.filter(r => r.batchId === currentBatchId)
    : [];
  const displayRecords = batchRecords.length > 0 ? batchRecords : mockDegreasingRecords;

  const [tempData, setTempData] = useState<any[]>([]);
  const [params, setParams] = useState({
    temperature: 54.5,
    time: 12,
    concentration: 8.5,
  });
  const [operator, setOperator] = useState(currentBatch?.operator ?? '');
  const [note, setNote] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    setTempData(generateTempData());
  }, []);

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
    showToast('success', '脱脂工序已开始');
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
    const paramsSummary = `温度${params.temperature}℃ 时间${params.time}分钟 浓度${params.concentration}%`;
    const finalNote = note ? `${note} | ${paramsSummary}` : paramsSummary;
    completeProcess(currentBatchId, STEP, 'pass', finalNote);
    showToast('success', '脱脂工序登记完成');
    setNote('');
  };

  const progressPercent = useMemo(() => {
    if (!stepRecord) return 0;
    if (stepRecord.status === 'completed') return 100;
    if (stepRecord.status === 'running') {
      const start = stepRecord.startTime ? new Date(stepRecord.startTime).getTime() : Date.now();
      const elapsed = (Date.now() - start) / 60000;
      return Math.min((elapsed / params.time) * 100, 95);
    }
    return 0;
  }, [stepRecord, params.time]);

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
        <StatCard title="当前温度" value={params.temperature.toFixed(1)} unit="℃" icon={Thermometer} color="accent" trend={0.5} trendLabel="目标 55℃" />
        <StatCard title="处理时间" value={params.time} unit="分钟" icon={Clock} color="primary" />
        <StatCard title="药液浓度" value={params.concentration} unit="%" icon={Droplets} color="success" />
        <StatCard title="本批次记录" value={batchRecords.length} unit="条" icon={Clock} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ChartCard
            title="温度曲线"
            subtitle="脱脂槽温度实时监控"
            action={
              <div className="flex items-center gap-3">
                <StatusBadge status={stepRecord?.status === 'running' ? 'running' : stepRecord?.status === 'completed' ? 'pass' : 'stop'} text={stepRecord?.status === 'running' ? '运行中' : stepRecord?.status === 'completed' ? '已完成' : '待开始'} />
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
          <ChartCard title="工序状态" subtitle="脱脂工序进度">
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

          <ChartCard title="参数设置" subtitle="脱脂工艺参数配置">
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
                <label className="text-sm text-dark-300">目标温度 (℃)</label>
                <input
                  type="number"
                  value={params.temperature}
                  onChange={(e) => setParams({ ...params, temperature: Number(e.target.value) })}
                  className="input-field mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm text-dark-300">处理时间 (分钟)</label>
                <input
                  type="number"
                  value={params.time}
                  onChange={(e) => setParams({ ...params, time: Number(e.target.value) })}
                  className="input-field mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm text-dark-300">目标浓度 (%)</label>
                <input
                  type="number"
                  value={params.concentration}
                  onChange={(e) => setParams({ ...params, concentration: Number(e.target.value) })}
                  step={0.1}
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

      <ChartCard title="历史记录" subtitle={currentBatchId ? `批次 ${currentBatch?.batchNo} 脱脂记录` : '脱脂处理记录'}>
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
              {displayRecords.map((record) => (
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
