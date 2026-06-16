import { useState, useMemo, useEffect } from 'react';
import { Grid3X3, Shield, CheckCircle, Plus, TrendingUp, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
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
import BatchSelector from '@/components/ui/BatchSelector';
import { useProductionStore } from '@/store/productionStore';

const gradeDescriptions: Record<number, { label: string; desc: string; color: string }> = {
  0: { label: '0级', desc: '切口边缘完全光滑，无任何脱落', color: 'text-success' },
  1: { label: '1级', desc: '切口交叉处有少许涂层脱落，不影响使用', color: 'text-success' },
  2: { label: '2级', desc: '切口边缘和交叉处有涂层脱落，面积小于5%', color: 'text-warning' },
  3: { label: '3级', desc: '切口边缘有部分涂层脱落，面积5%-15%', color: 'text-warning' },
  4: { label: '4级', desc: '涂层大片脱落，面积15%-35%', color: 'text-danger' },
  5: { label: '5级', desc: '涂层严重脱落，面积大于35%', color: 'text-danger' },
};

const positions = [
  '正面中心', '正面左上角', '正面右上角',
  '侧面边缘', '底部中心',
];

function AdhesionPage() {
  const {
    currentBatchId,
    getCurrentBatch,
    adhesionRecords,
    addAdhesionRecord,
    startProcess,
    getProcessRecord,
  } = useProductionStore();

  const currentBatch = getCurrentBatch();
  const stepRecord = currentBatchId ? getProcessRecord(currentBatchId, 'adhesion') : null;
  const batchRecords = useMemo(
    () => adhesionRecords.filter(r => r.batchId === currentBatchId),
    [adhesionRecords, currentBatchId]
  );
  const latest = batchRecords[batchRecords.length - 1];

  const [selectedGrade, setSelectedGrade] = useState<number>(latest?.grade ?? 1);
  const [testPosition, setTestPosition] = useState(latest?.position || '正面中心');
  const [inspector, setInspector] = useState(latest?.inspector || currentBatch?.operator || '质检');
  const [note, setNote] = useState(latest?.note || '');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    const latestRec = batchRecords[batchRecords.length - 1];
    setSelectedGrade(latestRec?.grade ?? 1);
    setTestPosition(latestRec?.position || '正面中心');
    setInspector(latestRec?.inspector || currentBatch?.operator || '质检');
    setNote(latestRec?.note || '');
  }, [currentBatchId]);

  const overall = useMemo(() => {
    const records = adhesionRecords.length > 0 ? adhesionRecords : batchRecords;
    if (records.length === 0) {
      return { avg: 0, passRate: 0, zeroRate: 0, stats: [] as any[] };
    }
    const avg = Number((records.reduce((s, r) => s + r.grade, 0) / records.length).toFixed(1));
    const passed = records.filter(r => r.grade <= 2).length;
    const zero = records.filter(r => r.grade === 0).length;
    const counts = [0, 1, 2, 3, 4, 5].map(g => records.filter(r => r.grade === g).length);
    const stats = [0, 1, 2, 3, 4, 5].map(g => ({
      grade: `${g}级`,
      count: counts[g],
      percentage: records.length ? Math.round((counts[g] / records.length) * 100) : 0,
    }));
    return {
      avg,
      passRate: Number(((passed / records.length) * 100).toFixed(1)),
      zeroRate: Number(((zero / records.length) * 100).toFixed(1)),
      stats,
    };
  }, [adhesionRecords, batchRecords]);

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
      startProcess(currentBatchId, 'adhesion', inspector);
    }
    const result: any = selectedGrade <= 1 ? 'pass' : selectedGrade <= 3 ? 'pending' : 'fail';
    addAdhesionRecord({
      batchId: currentBatchId,
      batchNo: currentBatch!.batchNo,
      workpieceName: currentBatch!.workpieceName,
      grade: selectedGrade,
      position: testPosition,
      inspector,
      note: note || undefined,
      result,
      time: new Date().toLocaleString('zh-CN'),
    });
    showToast('success', `附着力检测已提交 · ${selectedGrade}级`);
    setNote('');
  };

  const handleLoadRecord = (rec: typeof adhesionRecords[0]) => {
    setSelectedGrade(rec.grade);
    setTestPosition(rec.position);
    setInspector(rec.inspector);
    setNote(rec.note || '');
  };

  return (
    <div className="space-y-6">
      <BatchSelector requiredStep="adhesion" />

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
        <StatCard title="平均等级" value={overall.avg || '--'} unit="级" icon={Shield} color={overall.avg <= 1 ? 'success' : overall.avg <= 2 ? 'warning' : 'accent'} />
        <StatCard title="合格率(≤2级)" value={overall.passRate} unit="%" icon={CheckCircle} color="accent" />
        <StatCard title="本批次检测" value={batchRecords.length} unit="次" icon={Grid3X3} color="primary" />
        <StatCard title="0级率" value={overall.zeroRate} unit="%" icon={TrendingUp} color="warning" />
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
                          : selectedGrade >= 4
                          ? 'bg-danger/15'
                          : selectedGrade >= 5
                          ? 'bg-danger/25'
                          : 'bg-dark-800/50'
                      }`}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-4xl font-bold font-display ${gradeDescriptions[selectedGrade].color}`}>
                    {gradeDescriptions[selectedGrade].label}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center px-4">
              <p className={`text-sm font-medium ${gradeDescriptions[selectedGrade].color}`}>
                {gradeDescriptions[selectedGrade].desc}
              </p>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="等级分布" subtitle="所有检测记录分布">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overall.stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="grade" stroke="#66758F" fontSize={11} />
                <YAxis stroke="#66758F" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="检测次数" fill="#286FCC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <div className="space-y-5">
          <ChartCard title="检测录入" subtitle={currentBatch ? `批次: ${currentBatch.batchNo}` : '请选择批次'}>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-dark-400 block mb-1.5">检测等级</label>
                <div className="grid grid-cols-6 gap-1">
                  {[0, 1, 2, 3, 4, 5].map((grade) => (
                    <button
                      key={grade}
                      onClick={() => setSelectedGrade(grade)}
                      className={`py-2 rounded text-sm font-medium transition-all ${
                        selectedGrade === grade
                          ? grade <= 1 ? 'bg-success text-white'
                          : grade <= 3 ? 'bg-warning text-white'
                          : 'bg-danger text-white'
                          : 'bg-dark-700/50 text-dark-300 hover:bg-dark-700'
                      }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-dark-400 block mb-1.5">检测位置</label>
                <select
                  value={testPosition}
                  onChange={(e) => setTestPosition(e.target.value)}
                  className="input-field py-2"
                >
                  {positions.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-dark-400 block mb-1.5">质检员</label>
                <input
                  type="text"
                  value={inspector}
                  onChange={(e) => setInspector(e.target.value)}
                  className="input-field py-2"
                />
              </div>
              <div>
                <label className="text-xs text-dark-400 block mb-1.5">备注</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="输入检测备注..."
                  rows={2}
                  className="input-field py-2 resize-none"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!currentBatchId}
                className="btn-accent w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                提交检测
              </button>
            </div>
          </ChartCard>
        </div>
      </div>

      <ChartCard title="历史记录" subtitle={`本批次 ${batchRecords.length} 条 · 全局 ${adhesionRecords.length} 条`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-dark-400 border-b border-dark-700/50">
                <th className="pb-3 font-medium">批次号</th>
                <th className="pb-3 font-medium">工件</th>
                <th className="pb-3 font-medium">等级</th>
                <th className="pb-3 font-medium">检测位置</th>
                <th className="pb-3 font-medium">质检员</th>
                <th className="pb-3 font-medium">备注</th>
                <th className="pb-3 font-medium">检测时间</th>
                <th className="pb-3 font-medium">结果</th>
                <th className="pb-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {adhesionRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-dark-500 text-sm">
                    暂无记录，请先选择批次并提交检测
                  </td>
                </tr>
              ) : (
                adhesionRecords.slice().reverse().map((record) => (
                  <tr
                    key={record.id}
                    className={`border-b border-dark-700/30 transition-colors ${
                      record.batchId === currentBatchId ? 'bg-primary-500/5' : 'hover:bg-dark-700/20'
                    }`}
                  >
                    <td className="py-3 font-medium text-primary-400">{record.batchNo}</td>
                    <td className="py-3 text-dark-300 text-xs">{record.workpieceName}</td>
                    <td className="py-3">
                      <span className={`font-bold text-base ${
                        record.grade <= 1 ? 'text-success' : record.grade <= 3 ? 'text-warning' : 'text-danger'
                      }`}>
                        {record.grade}级
                      </span>
                    </td>
                    <td className="py-3 text-dark-300">{record.position}</td>
                    <td className="py-3 text-dark-300">{record.inspector}</td>
                    <td className="py-3 text-dark-400 text-xs max-w-[120px] truncate" title={record.note}>
                      {record.note || '--'}
                    </td>
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

export default AdhesionPage;
