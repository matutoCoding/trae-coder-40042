import { useState, useEffect, useMemo } from 'react';
import { Thermometer, Clock, Flame, TrendingUp, Play, CheckCircle, XCircle, User, Settings } from 'lucide-react';
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
import BatchSelector from '@/components/ui/BatchSelector';
import { useProductionStore } from '@/store/productionStore';
import { mockOvenZones, generateOvenTempData } from '@/data/mockData';

const STEP = 'oven' as const;

function OvenPage() {
  const {
    currentBatchId,
    getCurrentBatch,
    startProcess,
    completeProcess,
    getProcessRecord,
  } = useProductionStore();

  const currentBatch = getCurrentBatch();
  const stepRecord = currentBatchId ? getProcessRecord(currentBatchId, STEP) : null;

  const [tempData, setTempData] = useState<any[]>([]);
  const [zones] = useState(mockOvenZones);
  const [params, setParams] = useState({
    targetTemp: 180,
    holdTime: 25,
    heatRate: 3.2,
    processTime: 30,
  });
  const [operator, setOperator] = useState(currentBatch?.operator ?? '');
  const [note, setNote] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    setTempData(generateOvenTempData());
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
    showToast('success', '固化炉工序已开始');
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
    const paramsSummary = `目标温度${params.targetTemp}℃ 保温时间${params.holdTime}分钟 升温速率${params.heatRate}℃/min`;
    const finalNote = note ? `${note} | ${paramsSummary}` : paramsSummary;
    completeProcess(currentBatchId, STEP, 'pass', finalNote);
    showToast('success', '固化炉工序登记完成');
    setNote('');
  };

  const progressPercent = useMemo(() => {
    if (!stepRecord) return 0;
    if (stepRecord.status === 'completed') return 100;
    if (stepRecord.status === 'running') {
      const start = stepRecord.startTime ? new Date(stepRecord.startTime).getTime() : Date.now();
      const elapsed = (Date.now() - start) / 60000;
      return Math.min((elapsed / params.processTime) * 100, 95);
    }
    return 0;
  }, [stepRecord, params.processTime]);

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
        <StatCard title="最高温度" value={params.targetTemp + 2} unit="℃" icon={Thermometer} color="accent" />
        <StatCard title="保温时间" value={params.holdTime} unit="分钟" icon={Clock} color="primary" />
        <StatCard title="升温速率" value={params.heatRate} unit="℃/min" icon={TrendingUp} color="success" />
        <StatCard title="运行状态" value={stepRecord?.status === 'running' ? '运行中' : stepRecord?.status === 'completed' ? '已完成' : '待机'} unit="" icon={Flame} color="warning" />
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
                dataKey={() => params.targetTemp}
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
              <label className="text-sm text-dark-300">固化温度 (℃)</label>
              <input
                type="number"
                value={params.targetTemp}
                onChange={(e) => setParams({ ...params, targetTemp: Number(e.target.value) })}
                className="input-field mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm text-dark-300">保温时间 (分钟)</label>
              <input
                type="number"
                value={params.holdTime}
                onChange={(e) => setParams({ ...params, holdTime: Number(e.target.value) })}
                className="input-field mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm text-dark-300">升温速率 (℃/min)</label>
              <input
                type="number"
                value={params.heatRate}
                onChange={(e) => setParams({ ...params, heatRate: Number(e.target.value) })}
                step={0.1}
                className="input-field mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm text-dark-300">工艺时间 (分钟)</label>
              <input
                type="number"
                value={params.processTime}
                onChange={(e) => setParams({ ...params, processTime: Number(e.target.value) })}
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

        <ChartCard title="工序状态" subtitle="固化炉工序进度">
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
