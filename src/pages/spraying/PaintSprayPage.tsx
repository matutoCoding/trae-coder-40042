import { useState, useEffect, useMemo } from 'react';
import { Paintbrush, Droplets, Ruler, Layers, Play, CheckCircle, XCircle, User, Settings } from 'lucide-react';
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
} from 'recharts';
import StatusBadge from '@/components/ui/StatusBadge';
import BatchSelector from '@/components/ui/BatchSelector';
import { useProductionStore } from '@/store/productionStore';
import { mockSprayGuns } from '@/data/mockData';

const STEP = 'paint' as const;

function generatePaintData() {
  const data = [];
  for (let i = 10; i >= 0; i--) {
    data.push({
      time: `${i}h前`,
      thickness: 80 + Math.random() * 20,
      target: 90,
    });
  }
  return data.reverse();
}

function PaintSprayPage() {
  const {
    currentBatchId,
    getCurrentBatch,
    startProcess,
    completeProcess,
    getProcessRecord,
  } = useProductionStore();

  const currentBatch = getCurrentBatch();
  const stepRecord = currentBatchId ? getProcessRecord(currentBatchId, STEP) : null;

  const [paintData] = useState(generatePaintData());
  const paintGuns = mockSprayGuns.filter((g) => g.type === 'paint');
  const [params, setParams] = useState({
    pressure: 0.45,
    flowRate: 180,
    targetThickness: 90,
    fanWidth: 25,
    gunDistance: 20,
    processTime: 20,
  });
  const [operator, setOperator] = useState(currentBatch?.operator ?? '');
  const [note, setNote] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

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
    showToast('success', '喷漆工序已开始');
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
    const paramsSummary = `压力${params.pressure}MPa 流量${params.flowRate}ml/min 目标膜厚${params.targetThickness}μm 扇幅${params.fanWidth}cm 枪距${params.gunDistance}cm`;
    const finalNote = note ? `${note} | ${paramsSummary}` : paramsSummary;
    completeProcess(currentBatchId, STEP, 'pass', finalNote);
    showToast('success', '喷漆工序登记完成');
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
        <StatCard title="喷漆压力" value={params.pressure} unit="MPa" icon={Droplets} color="accent" />
        <StatCard title="油漆流量" value={params.flowRate} unit="ml/min" icon={Paintbrush} color="primary" />
        <StatCard title="目标膜厚" value={params.targetThickness} unit="μm" icon={Ruler} color="success" />
        <StatCard title="运行喷枪" value={`${paintGuns.filter(g => g.status === 'running').length}/${paintGuns.length}`} unit="支" icon={Layers} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ChartCard title="膜厚趋势" subtitle="漆膜厚度实时监控">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={paintData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#66758F" fontSize={11} />
                  <YAxis stroke="#66758F" fontSize={11} domain={[60, 120]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="target" name="目标膜厚" stroke="#10B981" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="thickness" name="实际膜厚" stroke="#FF6B35" strokeWidth={2} dot={{ fill: '#FF6B35', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="油漆配比" subtitle="当前使用油漆配方">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-dark-700/30 rounded-lg">
                  <p className="text-2xl font-bold font-display text-primary-400">主漆</p>
                  <p className="text-lg text-white mt-1">100 份</p>
                </div>
                <div className="text-center p-4 bg-dark-700/30 rounded-lg">
                  <p className="text-2xl font-bold font-display text-accent-400">固化剂</p>
                  <p className="text-lg text-white mt-1">50 份</p>
                </div>
                <div className="text-center p-4 bg-dark-700/30 rounded-lg">
                  <p className="text-2xl font-bold font-display text-success">稀释剂</p>
                  <p className="text-lg text-white mt-1">20 份</p>
                </div>
              </div>
            </ChartCard>

            <ChartCard title="颜色管理" subtitle="当前批次颜色">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg" />
                  <div>
                    <p className="text-white font-medium">深蓝金属漆</p>
                    <p className="text-sm text-dark-400">色号: BL-2026-M</p>
                    <p className="text-sm text-dark-400">批次: P20260615003</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-dark-700/50 flex items-center justify-between">
                  <span className="text-sm text-dark-400">剩余油漆量</span>
                  <span className="text-white font-medium">12.5 L</span>
                </div>
              </div>
            </ChartCard>
          </div>
        </div>

        <div className="space-y-6">
          <ChartCard title="工序状态" subtitle="喷漆工序进度">
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

          <ChartCard title="喷漆参数" subtitle="当前喷漆工艺配置">
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
                <label className="text-sm text-dark-300">喷漆压力 (MPa)</label>
                <input
                  type="number"
                  value={params.pressure}
                  onChange={(e) => setParams({ ...params, pressure: Number(e.target.value) })}
                  step={0.01}
                  className="input-field mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm text-dark-300">油漆流量 (ml/min)</label>
                <input
                  type="number"
                  value={params.flowRate}
                  onChange={(e) => setParams({ ...params, flowRate: Number(e.target.value) })}
                  className="input-field mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm text-dark-300">目标膜厚 (μm)</label>
                <input
                  type="number"
                  value={params.targetThickness}
                  onChange={(e) => setParams({ ...params, targetThickness: Number(e.target.value) })}
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

          <ChartCard title="喷枪列表" subtitle="喷漆枪运行状态">
            <div className="space-y-2">
              {paintGuns.map((gun) => (
                <div key={gun.id} className="flex items-center justify-between p-2.5 bg-dark-700/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Paintbrush size={16} className="text-primary-400" />
                    <span className="text-sm text-dark-200">{gun.name}</span>
                  </div>
                  <StatusBadge status={gun.status} size="sm" />
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

export default PaintSprayPage;
