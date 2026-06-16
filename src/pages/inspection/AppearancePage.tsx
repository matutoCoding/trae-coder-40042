import { useState, useMemo, useEffect } from 'react';
import { Eye, AlertTriangle, Image, Plus, CheckCircle, Star, Save, CheckCircle2 } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ChartCard } from '@/components/charts/ChartCard';
import StatusBadge from '@/components/ui/StatusBadge';
import BatchSelector from '@/components/ui/BatchSelector';
import { useProductionStore } from '@/store/productionStore';

const gradeConfig: Record<string, { label: string; desc: string; color: string; bgColor: string }> = {
  A: { label: 'A级', desc: '表面光滑平整，无可见缺陷', color: 'text-success', bgColor: 'bg-success/20' },
  B: { label: 'B级', desc: '轻微橘皮纹理，不影响使用', color: 'text-primary-400', bgColor: 'bg-primary-500/20' },
  C: { label: 'C级', desc: '明显橘皮，需评估处理', color: 'text-warning', bgColor: 'bg-warning/20' },
  D: { label: 'D级', desc: '严重缺陷，需返工', color: 'text-danger', bgColor: 'bg-danger/20' },
};

const defectTypes = [
  '橘皮', '流挂', '针孔', '气泡', '缩孔', '颗粒', '色差', '漏喷',
];

function AppearancePage() {
  const {
    currentBatchId,
    getCurrentBatch,
    appearanceRecords,
    addAppearanceRecord,
    startProcess,
    getProcessRecord,
  } = useProductionStore();

  const currentBatch = getCurrentBatch();
  const stepRecord = currentBatchId ? getProcessRecord(currentBatchId, 'appearance') : null;
  const batchRecords = useMemo(
    () => appearanceRecords.filter(r => r.batchId === currentBatchId),
    [appearanceRecords, currentBatchId]
  );
  const latest = batchRecords[batchRecords.length - 1];

  const [selectedGrade, setSelectedGrade] = useState<string>(latest?.grade || 'B');
  const [selectedDefects, setSelectedDefects] = useState<string[]>(latest?.defects || ['橘皮']);
  const [description, setDescription] = useState(latest?.description || '表面有轻微橘皮纹理，分布均匀，不影响整体外观质量。');
  const [inspector, setInspector] = useState(latest?.inspector || currentBatch?.operator || '质检');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    const latestRec = batchRecords[batchRecords.length - 1];
    setSelectedGrade(latestRec?.grade || 'B');
    setSelectedDefects(latestRec?.defects || ['橘皮']);
    setDescription(latestRec?.description || '表面有轻微橘皮纹理，分布均匀，不影响整体外观质量。');
    setInspector(latestRec?.inspector || currentBatch?.operator || '质检');
  }, [currentBatchId]);

  const toggleDefect = (defect: string) => {
    setSelectedDefects((prev) =>
      prev.includes(defect) ? prev.filter((d) => d !== defect) : [...prev, defect]
    );
  };

  const overall = useMemo(() => {
    const records = appearanceRecords;
    if (records.length === 0) {
      return {
        aRate: 0, passRate: 0, batchCount: batchRecords.length, defectTotal: 0,
        gradeStats: [
          { grade: 'A', count: 0, label: 'A级' },
          { grade: 'B', count: 0, label: 'B级' },
          { grade: 'C', count: 0, label: 'C级' },
          { grade: 'D', count: 0, label: 'D级' },
        ],
        defectStats: {} as Record<string, number>,
      };
    }
    const gradeCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    const defectCounts: Record<string, number> = {};
    records.forEach(r => {
      gradeCounts[r.grade] = (gradeCounts[r.grade] || 0) + 1;
      r.defects.forEach(d => { defectCounts[d] = (defectCounts[d] || 0) + 1; });
    });
    const total = records.length;
    const aCount = gradeCounts.A || 0;
    const passCount = (gradeCounts.A || 0) + (gradeCounts.B || 0);
    return {
      aRate: Math.round((aCount / total) * 100),
      passRate: Math.round((passCount / total) * 100),
      batchCount: batchRecords.length,
      defectTotal: Object.values(defectCounts).reduce((s, v) => s + v, 0),
      gradeStats: Object.entries(gradeCounts).map(([g, c]) => ({ grade: g, count: Math.round((c / total) * 100), label: `${g}级` })),
      defectStats: defectCounts,
    };
  }, [appearanceRecords, batchRecords]);

  const defectStatsList = [
    { name: '橘皮', key: '橘皮' },
    { name: '流挂', key: '流挂' },
    { name: '针孔', key: '针孔' },
    { name: '缩孔', key: '缩孔' },
    { name: '颗粒', key: '颗粒' },
    { name: '色差', key: '色差' },
  ];

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
      startProcess(currentBatchId, 'appearance', inspector);
    }
    const result: any = selectedGrade === 'A' || selectedGrade === 'B' ? 'pass' : selectedGrade === 'C' ? 'pending' : 'fail';
    addAppearanceRecord({
      batchId: currentBatchId,
      batchNo: currentBatch!.batchNo,
      workpieceName: currentBatch!.workpieceName,
      grade: selectedGrade,
      defects: [...selectedDefects],
      description,
      inspector,
      result,
      time: new Date().toLocaleString('zh-CN'),
    });
    showToast('success', `外观检查已提交 · ${selectedGrade}级`);
  };

  const handleLoadRecord = (rec: typeof appearanceRecords[0]) => {
    setSelectedGrade(rec.grade);
    setSelectedDefects(rec.defects);
    setDescription(rec.description);
    setInspector(rec.inspector);
  };

  return (
    <div className="space-y-6">
      <BatchSelector requiredStep="appearance" />

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
        <StatCard title="A级率" value={overall.aRate} unit="%" icon={Star} color="success" />
        <StatCard title="外观合格率(A+B)" value={overall.passRate} unit="%" icon={CheckCircle} color="accent" />
        <StatCard title="本批次检测" value={overall.batchCount} unit="次" icon={Eye} color="primary" />
        <StatCard title="缺陷项次" value={overall.defectTotal} unit="项" icon={AlertTriangle} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="外观等级评定"
            subtitle={currentBatch ? `批次: ${currentBatch.batchNo}` : '请先选择批次'}
          >
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
                    <p className="text-xl font-bold font-display">{config.label}</p>
                  </button>
                ))}
              </div>

              <div className={`p-4 rounded-lg ${gradeConfig[selectedGrade].bgColor}`}>
                <p className={`text-sm font-medium ${gradeConfig[selectedGrade].color}`}>
                  {gradeConfig[selectedGrade].desc}
                </p>
              </div>

              <div>
                <p className="text-sm text-dark-300 mb-3">缺陷类型（点击选择）</p>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-dark-400 block mb-1">质检员</label>
                  <input
                    type="text"
                    value={inspector}
                    onChange={(e) => setInspector(e.target.value)}
                    className="input-field py-2"
                  />
                </div>
                <div className="flex items-end">
                  <div className="text-xs text-dark-400">
                    <p>已选缺陷：<span className="text-accent-400">{selectedDefects.length} 项</span></p>
                    <p className="mt-0.5">已选等级：<span className={gradeConfig[selectedGrade].color}>{selectedGrade}级</span></p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-dark-400 block mb-1">缺陷描述</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="请描述外观缺陷详情..."
                  className="input-field py-2 resize-none"
                />
              </div>

              <div className="flex items-center justify-center p-4 border-2 border-dashed border-dark-600/50 rounded-lg hover:border-primary-500/50 transition-colors cursor-pointer">
                <div className="text-center">
                  <Image size={32} className="mx-auto text-dark-500" />
                  <p className="text-sm text-dark-400 mt-2">点击上传检测图片</p>
                  <p className="text-xs text-dark-500 mt-1">支持 JPG、PNG 格式</p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!currentBatchId}
                className="btn-accent w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                提交检测结果
              </button>
            </div>
          </ChartCard>
        </div>

        <div className="space-y-6">
          <ChartCard title="等级分布" subtitle="外观质量等级分布">
            <div className="space-y-3">
              {overall.gradeStats.map((item) => (
                <div key={item.grade}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className={`font-medium ${gradeConfig[item.grade].color}`}>
                      {item.label}
                    </span>
                    <span className="text-dark-300">{item.count}%</span>
                  </div>
                  <div className="h-2.5 bg-dark-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.grade === 'A' ? 'bg-success' :
                        item.grade === 'B' ? 'bg-primary-500' :
                        item.grade === 'C' ? 'bg-warning' : 'bg-danger'
                      } transition-all`}
                      style={{ width: `${item.count}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="缺陷统计" subtitle="常见缺陷类型出现次数">
            <div className="grid grid-cols-2 gap-3">
              {defectStatsList.map(d => (
                <div key={d.key} className="p-3 bg-dark-700/30 rounded-lg text-center">
                  <p className="text-2xl font-bold font-display text-primary-400 tabular-nums">
                    {overall.defectStats[d.key] || 0}
                  </p>
                  <p className="text-xs text-dark-400 mt-1">{d.name}</p>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>

      <ChartCard title="历史记录" subtitle={`本批次 ${batchRecords.length} 条 · 全局 ${appearanceRecords.length} 条`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-dark-400 border-b border-dark-700/50">
                <th className="pb-3 font-medium">批次号</th>
                <th className="pb-3 font-medium">工件</th>
                <th className="pb-3 font-medium">等级</th>
                <th className="pb-3 font-medium">缺陷</th>
                <th className="pb-3 font-medium">描述</th>
                <th className="pb-3 font-medium">质检员</th>
                <th className="pb-3 font-medium">检测时间</th>
                <th className="pb-3 font-medium">结果</th>
                <th className="pb-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {appearanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-dark-500 text-sm">
                    暂无记录，请先选择批次并提交检测
                  </td>
                </tr>
              ) : (
                appearanceRecords.slice().reverse().map((record) => (
                  <tr
                    key={record.id}
                    className={`border-b border-dark-700/30 transition-colors ${
                      record.batchId === currentBatchId ? 'bg-primary-500/5' : 'hover:bg-dark-700/20'
                    }`}
                  >
                    <td className="py-3 font-medium text-primary-400">{record.batchNo}</td>
                    <td className="py-3 text-dark-300 text-xs">{record.workpieceName}</td>
                    <td className="py-3">
                      <span className={`font-bold ${gradeConfig[record.grade].color}`}>
                        {record.grade}级
                      </span>
                    </td>
                    <td className="py-3 text-dark-300 text-xs">
                      {record.defects.length > 0
                        ? <span className="text-accent-400">{record.defects.join('、')}</span>
                        : <span className="text-success">无</span>}
                    </td>
                    <td className="py-3 text-dark-400 max-w-[160px] truncate text-xs" title={record.description}>
                      {record.description}
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

export default AppearancePage;
