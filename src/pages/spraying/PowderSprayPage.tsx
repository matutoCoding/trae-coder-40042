import { useState, useEffect, useMemo } from 'react';
import { Zap, Activity, Gauge, Wind, Play, CheckCircle, XCircle, User, Settings } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ChartCard } from '@/components/charts/ChartCard';
import StatusBadge from '@/components/ui/StatusBadge';
import BatchSelector from '@/components/ui/BatchSelector';
import { useProductionStore } from '@/store/productionStore';
import { mockSprayGuns } from '@/data/mockData';

const STEP = 'powder' as const;

function PowderSprayPage() {
  const {
    currentBatchId,
    getCurrentBatch,
    startProcess,
    completeProcess,
    getProcessRecord,
  } = useProductionStore();

  const currentBatch = getCurrentBatch();
  const stepRecord = currentBatchId ? getProcessRecord(currentBatchId, STEP) : null;

  const [selectedGun, setSelectedGun] = useState('G01');
  const [params, setParams] = useState({
    voltage: 76.5,
    current: 21.3,
    powderOutput: 125,
    fluidizingPressure: 0.45,
    processTime: 15,
  });
  const [operator, setOperator] = useState(currentBatch?.operator ?? '');
  const [note, setNote] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const powderGuns = mockSprayGuns.filter((g) => g.type === 'powder');

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
    showToast('success', '静电喷粉工序已开始');
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
    const paramsSummary = `电压${params.voltage}KV 电流${params.current}μA 出粉量${params.powderOutput}g/min 流化气压${params.fluidizingPressure}MPa`;
    const finalNote = note ? `${note} | ${paramsSummary}` : paramsSummary;
    completeProcess(currentBatchId, STEP, 'pass', finalNote);
    showToast('success', '静电喷粉工序登记完成');
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
        <StatCard title="喷粉电压" value={params.voltage} unit="KV" icon={Zap} color="accent" />
        <StatCard title="喷粉电流" value={params.current} unit="μA" icon={Activity} color="primary" />
        <StatCard title="出粉量" value={params.powderOutput} unit="g/min" icon={Gauge} color="success" />
        <StatCard title="运行喷枪" value={`${powderGuns.filter(g => g.status === 'running').length}/${powderGuns.length}`} unit="支" icon={Wind} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ChartCard title="喷枪状态" subtitle="静电喷粉设备监控">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {powderGuns.map((gun) => (
                <div
                  key={gun.id}
                  onClick={() => setSelectedGun(gun.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedGun === gun.id
                      ? 'bg-primary-500/10 border-primary-500/50'
                      : 'bg-dark-700/30 border-dark-600/30 hover:border-primary-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">{gun.name}</h4>
                    <StatusBadge status={gun.status} size="sm" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-xl font-bold font-display text-accent-400">{gun.voltage || 0}</p>
                      <p className="text-xs text-dark-400">KV</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold font-display text-primary-400">{gun.current || 0}</p>
                      <p className="text-xs text-dark-400">μA</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold font-display text-success">{gun.powderOutput || 0}</p>
                      <p className="text-xs text-dark-400">g/min</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        <div className="space-y-6">
          <ChartCard title="工序状态" subtitle="静电喷粉工序进度">
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

          <ChartCard title="参数调节" subtitle="喷粉工艺参数">
            <div className="space-y-5">
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-dark-300">静电电压</label>
                  <span className="text-sm text-accent-400 font-mono">{params.voltage} KV</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="90"
                  value={params.voltage}
                  onChange={(e) => setParams({ ...params, voltage: Number(e.target.value) })}
                  className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-accent-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-dark-300">出粉量</label>
                  <span className="text-sm text-primary-400 font-mono">{params.powderOutput} g/min</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={params.powderOutput}
                  onChange={(e) => setParams({ ...params, powderOutput: Number(e.target.value) })}
                  className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-dark-300">流化气压</label>
                  <span className="text-sm text-success font-mono">{params.fluidizingPressure} MPa</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.6"
                  step="0.01"
                  value={params.fluidizingPressure}
                  onChange={(e) => setParams({ ...params, fluidizingPressure: Number(e.target.value) })}
                  className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-success"
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="粉房状态" subtitle="喷粉房环境">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
              <span className="text-sm text-dark-300">房内温度</span>
              <span className="text-sm text-white font-medium">24.5 ℃</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
              <span className="text-sm text-dark-300">湿度</span>
              <span className="text-sm text-white font-medium">55 %</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
              <span className="text-sm text-dark-300">粉尘浓度</span>
              <span className="text-sm text-success font-medium">8 mg/m³</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
              <span className="text-sm text-dark-300">回收系统</span>
              <StatusBadge status="running" size="sm" />
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
              <span className="text-sm text-dark-300">滤芯状态</span>
              <span className="text-sm text-warning font-medium">72%</span>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="粉末利用率统计" subtitle="近7天粉末使用情况">
          <div className="h-48 bg-dark-700/20 rounded-lg flex items-center justify-center text-dark-500">
            图表区域 - 粉末利用率趋势图
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

export default PowderSprayPage;
