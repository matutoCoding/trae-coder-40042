import { useState, useMemo, useEffect } from 'react';
import { Ruler, Target, CheckCircle2, XCircle, Plus, TrendingUp, Save, AlertTriangle } from 'lucide-react';
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
import BatchSelector from '@/components/ui/BatchSelector';
import { useProductionStore } from '@/store/productionStore';

const POINT_LABELS = ['左上', '中上', '右上', '左中', '中心', '右中', '左下', '中下', '右下'];
const DEFAULT_TARGET = 85;
const DEFAULT_TOLERANCE = 8;

function ThicknessPage() {
  const {
    currentBatchId,
    getCurrentBatch,
    thicknessRecords,
    addThicknessRecord,
    startProcess,
    getProcessRecord,
  } = useProductionStore();

  const currentBatch = getCurrentBatch();
  const stepRecord = currentBatchId ? getProcessRecord(currentBatchId, 'thickness') : null;

  const batchRecords = useMemo(
    () => thicknessRecords.filter(r => r.batchId === currentBatchId),
    [thicknessRecords, currentBatchId]
  );

  const latest = batchRecords[batchRecords.length - 1];

  const [points, setPoints] = useState<number[]>(
    latest?.points || [82, 90, 86, 88, 85, 92, 87, 91, 84]
  );
  const [target, setTarget] = useState<number>(latest?.target || DEFAULT_TARGET);
  const [tolerance, setTolerance] = useState<number>(latest?.tolerance || DEFAULT_TOLERANCE);
  const [inspector, setInspector] = useState<string>(currentBatch?.operator || '质检');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    const latestRec = batchRecords[batchRecords.length - 1];
    setPoints(latestRec?.points || [82, 90, 86, 88, 85, 92, 87, 91, 84]);
    setTarget(latestRec?.target || DEFAULT_TARGET);
    setTolerance(latestRec?.tolerance || DEFAULT_TOLERANCE);
    setInspector(currentBatch?.operator || '质检');
  }, [currentBatchId]);

  const stats = useMemo(() => {
    if (points.length === 0) return { avg: 0, min: 0, max: 0, passRate: 0, passCount: 0, result: 'pending' as any };
    const sum = points.reduce((s, v) => s + v, 0);
    const avg = Number((sum / points.length).toFixed(1));
    const min = Math.min(...points);
    const max = Math.max(...points);
    const passCount = points.filter(v => Math.abs(v - target) <= tolerance).length;
    const passRate = Number(((passCount / points.length) * 100).toFixed(1));
    const result: any = passRate === 100 ? 'pass' : passRate >= 70 ? 'pending' : 'fail';
    return { avg, min, max, passRate, passCount, result };
  }, [points, target, tolerance]);

  const detectionPoints = useMemo(
    () => POINT_LABELS.map((label, i) => ({ id: i + 1, label, value: points[i] ?? 0 })),
    [points]
  );

  const trendData = useMemo(() => {
    const last10 = thicknessRecords.slice(-10);
    if (last10.length === 0) return [];
    return last10.map(r => ({
      date: r.time.split(' ')[0].slice(5),
      thickness: r.average,
      target: r.target,
    }));
  }, [thicknessRecords]);

  const getPointColor = (value: number) => {
    if (Math.abs(value - target) <= tolerance) return 'bg-success';
    if (Math.abs(value - target) <= tolerance * 1.5) return 'bg-warning';
    return 'bg-danger';
  };

  const updatePoint = (idx: number, delta: number) => {
    const next = [...points];
    next[idx] = Math.max(20, Math.min(200, next[idx] + delta));
    setPoints(next);
  };

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 2500);
  };

  const handleSubmit = () => {
    if (!currentBatchId) {
      showToast('error', '请先选择批次');
      return;
    }
    if (!stepRecord || stepRecord.status === 'pending') {
      startProcess(currentBatchId, 'thickness', inspector);
    }
    addThicknessRecord({
      batchId: currentBatchId,
      batchNo: currentBatch!.batchNo,
      workpieceName: currentBatch!.workpieceName,
      points: [...points],
      target,
      tolerance,
      min: stats.min,
      max: stats.max,
      average: stats.avg,
      passRate: stats.passRate,
      passCount: stats.passCount,
      inspector,
      result: stats.result,
      time: new Date().toLocaleString('zh-CN'),
    });
    showToast('success', `膜厚检测已提交 · 合格率 ${stats.passRate}%`);
  };

  const handleLoadRecord = (rec: typeof thicknessRecords[0]) => {
    setPoints(rec.points);
    setTarget(rec.target);
    setTolerance(rec.tolerance);
    setInspector(rec.inspector);
  };

  return (
    <div className="space-y-6">
      <BatchSelector requiredStep="thickness" />

      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] card px-5 py-3 flex items-center gap-2.5 animate-slide-up ${
            toast.type === 'success' ? 'border-success/40 text-success' : 'border-danger/40 text-danger'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          <span className="text-sm">{toast.msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="平均膜厚" value={stats.avg} unit="μm" icon={Ruler} color="accent" />
        <StatCard title="目标膜厚" value={target} unit="μm" icon={Target} color="primary" />
        <StatCard title="合格率" value={stats.passRate} unit="%" icon={CheckCircle2} color="success" />
        <StatCard
          title="本批次检测"
          value={batchRecords.length}
          unit="次"
          icon={TrendingUp}
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="检测点位" subtitle="9点检测法 · 点击数字上下调节">
          <div className="py-4">
            <div className="w-full aspect-square max-w-xs mx-auto bg-dark-700/30 rounded-lg relative p-3">
              <div className="grid grid-cols-3 gap-2 h-full">
                {detectionPoints.map((point, idx) => (
                  <div
                    key={point.id}
                    className="flex flex-col items-center justify-center bg-dark-800/50 rounded-lg border border-dark-600/50 hover:border-primary-500/30 transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-full ${getPointColor(point.value)} flex items-center justify-center text-white text-sm font-bold`}>
                      {point.value}
                    </div>
                    <span className="text-xs text-dark-400 mt-1">{point.label}</span>
                    <div className="flex items-center gap-1 mt-1">
                      <button
                        onClick={() => updatePoint(idx, -1)}
                        className="w-4 h-4 rounded bg-dark-700 text-dark-300 hover:bg-dark-600 text-[10px] leading-none"
                      >
                        −
                      </button>
                      <button
                        onClick={() => updatePoint(idx, 1)}
                        className="w-4 h-4 rounded bg-dark-700 text-dark-300 hover:bg-dark-600 text-[10px] leading-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-success" />
                <span className="text-xs text-dark-400">合格（±{tolerance}）</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-warning" />
                <span className="text-xs text-dark-400">偏差（±{tolerance * 1.5}）</span>
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
                <YAxis stroke="#66758F" fontSize={11} domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="膜厚μm" fill="#286FCC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <div className="space-y-5">
          <ChartCard
            title="检测参数"
            subtitle={currentBatch ? `批次: ${currentBatch.batchNo}` : '请选择批次'}
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs text-dark-400 block mb-1">目标膜厚 (μm)</label>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                  className="input-field py-2"
                />
              </div>
              <div>
                <label className="text-xs text-dark-400 block mb-1">公差 (μm)</label>
                <input
                  type="number"
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  className="input-field py-2"
                />
              </div>
              <div>
                <label className="text-xs text-dark-400 block mb-1">质检员</label>
                <input
                  type="text"
                  value={inspector}
                  onChange={(e) => setInspector(e.target.value)}
                  className="input-field py-2"
                />
              </div>
            </div>
          </ChartCard>

          <ChartCard title="检测结果">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 bg-dark-700/30 rounded-lg">
                <span className="text-xs text-dark-300">最小值</span>
                <span className="text-base font-bold font-display text-warning">{stats.min} μm</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-dark-700/30 rounded-lg">
                <span className="text-xs text-dark-300">最大值</span>
                <span className="text-base font-bold font-display text-accent-400">{stats.max} μm</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-dark-700/30 rounded-lg">
                <span className="text-xs text-dark-300">平均值</span>
                <span className="text-base font-bold font-display text-success">{stats.avg} μm</span>
              </div>
              <div className="pt-2 border-t border-dark-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dark-300">检测结果</span>
                  <StatusBadge status={stats.result} size="sm" />
                </div>
              </div>
            </div>
          </ChartCard>

          <button
            onClick={handleSubmit}
            disabled={!currentBatchId}
            className="btn-accent w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            提交检测记录
          </button>
        </div>
      </div>

      {trendData.length > 0 && (
        <ChartCard title="膜厚趋势" subtitle="最近10次检测平均膜厚趋势">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#66758F" fontSize={11} />
                <YAxis stroke="#66758F" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="target" name="目标" stroke="#10B981" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                <Line type="monotone" dataKey="thickness" name="实际" stroke="#FF6B35" strokeWidth={2} dot={{ fill: '#FF6B35', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      <ChartCard title="历史记录" subtitle={`本批次 ${batchRecords.length} 条 · 全局 ${thicknessRecords.length} 条`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-dark-400 border-b border-dark-700/50">
                <th className="pb-3 font-medium">批次号</th>
                <th className="pb-3 font-medium">工件</th>
                <th className="pb-3 font-medium">平均值</th>
                <th className="pb-3 font-medium">最小/大</th>
                <th className="pb-3 font-medium">目标</th>
                <th className="pb-3 font-medium">合格率</th>
                <th className="pb-3 font-medium">质检员</th>
                <th className="pb-3 font-medium">检测时间</th>
                <th className="pb-3 font-medium">结果</th>
                <th className="pb-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {thicknessRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-dark-500 text-sm">
                    暂无记录，请先选择批次并提交检测
                  </td>
                </tr>
              ) : (
                thicknessRecords.slice().reverse().map((record) => (
                  <tr
                    key={record.id}
                    className={`border-b border-dark-700/30 transition-colors ${
                      record.batchId === currentBatchId ? 'bg-primary-500/5' : 'hover:bg-dark-700/20'
                    }`}
                  >
                    <td className="py-3 font-medium text-primary-400">{record.batchNo}</td>
                    <td className="py-3 text-dark-300 text-xs">{record.workpieceName}</td>
                    <td className="py-3 text-dark-200">{record.average} μm</td>
                    <td className="py-3 text-dark-300 text-xs">{record.min}/{record.max}</td>
                    <td className="py-3 text-dark-300 text-xs">{record.target}±{record.tolerance}</td>
                    <td className={`py-3 ${record.passRate >= 90 ? 'text-success' : record.passRate >= 70 ? 'text-warning' : 'text-danger'}`}>
                      {record.passRate}%
                    </td>
                    <td className="py-3 text-dark-300">{record.inspector}</td>
                    <td className="py-3 text-dark-400 text-xs">{record.time}</td>
                    <td className="py-3">
                      <StatusBadge status={record.result} size="sm" />
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleLoadRecord(record)}
                        className="text-xs text-primary-400 hover:text-primary-300"
                      >
                        载入
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

export default ThicknessPage;
