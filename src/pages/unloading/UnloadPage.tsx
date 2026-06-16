import { useState, useMemo } from 'react';
import { Package, CheckCircle, XCircle, RefreshCw, PackageCheck, TrendingUp } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ChartCard } from '@/components/charts/ChartCard';
import StatusBadge from '@/components/ui/StatusBadge';
import BatchSelector from '@/components/ui/BatchSelector';
import { useProductionStore } from '@/store/productionStore';

function UnloadPage() {
  const {
    currentBatchId,
    getCurrentBatch,
    unloadingData,
    unloadingRecords,
    updateUnloadingQty,
    addUnloadingRecord,
    startProcess,
    completeProcess,
    getProcessRecord,
  } = useProductionStore();

  const currentBatch = getCurrentBatch();
  const data = currentBatchId ? unloadingData[currentBatchId] : undefined;
  const stepRecord = currentBatchId ? getProcessRecord(currentBatchId, 'unloading') : null;
  const batchRecords = unloadingRecords.filter(r => r.batchId === currentBatchId);

  const [failReason, setFailReason] = useState('');
  const [note, setNote] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const passQty = data?.passQty ?? 0;
  const failQty = data?.failQty ?? 0;
  const reworkQty = data?.reworkQty ?? 0;
  const total = passQty + failQty + reworkQty;
  const qty = currentBatch?.quantity ?? 0;
  const unloadedPercent = qty > 0 ? Math.min((total / qty) * 100, 100) : 0;

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 2500);
  };

  const handleDelta = (type: 'pass' | 'fail' | 'rework', delta: number) => {
    if (!currentBatchId) {
      showToast('error', '请先选择批次');
      return;
    }
    if (!stepRecord || stepRecord.status === 'pending') {
      startProcess(currentBatchId!, 'unloading', '系统自动');
    }
    const mapType = type === 'pass' ? 'passQty' : type === 'fail' ? 'failQty' : 'reworkQty';
    updateUnloadingQty(currentBatchId, mapType, delta);
  };

  const handleConfirm = () => {
    if (!currentBatchId || !currentBatch) {
      showToast('error', '请先选择批次');
      return;
    }
    if (stepRecord?.status === 'completed') {
      showToast('error', '本批次下件已完成，无法重复确认');
      return;
    }
    if (total !== qty) {
      showToast('error', `下件总数 (${total}) 必须等于上件数量 (${qty}) 才能确认`);
      return;
    }
    const rate = total > 0 ? (passQty / total) * 100 : 0;
    const result = rate >= 95 ? 'pass' : failQty > passQty ? 'fail' : 'pending';

    addUnloadingRecord({
      batchId: currentBatchId,
      batchNo: currentBatch!.batchNo,
      workpieceName: currentBatch!.workpieceName,
      totalQty: total,
      passQty,
      failQty,
      reworkQty,
      passRate: Number(rate.toFixed(1)),
      failReason: failReason || undefined,
      note: note || undefined,
      operator: currentBatch!.operator,
      time: new Date().toLocaleString('zh-CN'),
    });

    showToast('success', `批次 ${currentBatch!.batchNo} 下件登记成功`);
    setFailReason('');
    setNote('');
  };

  const displayRecords = useMemo(() => batchRecords, [batchRecords]);

  return (
    <div className="space-y-6">
      <BatchSelector requiredStep="unloading" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="批次总数"
          value={qty || 0}
          unit="件"
          icon={Package}
          color="primary"
        />
        <StatCard
          title="合格品"
          value={passQty}
          unit="件"
          icon={CheckCircle}
          color="success"
        />
        <StatCard
          title="不合格品"
          value={failQty}
          unit="件"
          icon={XCircle}
          color="danger"
        />
        <StatCard
          title="返工品"
          value={reworkQty}
          unit="件"
          icon={RefreshCw}
          color="warning"
        />
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="下件登记"
            subtitle={currentBatch ? `当前批次: ${currentBatch.batchNo} · ${currentBatch.workpieceName}` : '请先选择批次'}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-dark-700/30 rounded-lg">
                <div>
                  <p className="text-sm text-dark-400">工件名称</p>
                  <p className="text-lg font-medium text-white mt-1">
                    {currentBatch?.workpieceName || '--'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-dark-400">
                    上件总数 / 已下件 <span className="text-primary-400">({unloadedPercent.toFixed(0)}%)</span>
                  </p>
                  <p className="text-lg font-medium text-white mt-1">
                    <span className="text-dark-200">{qty}</span>
                    <span className="mx-2 text-dark-500">/</span>
                    <span className="text-primary-400">{total}</span>
                  </p>
                  <div className="h-1.5 mt-1.5 bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
                      style={{ width: `${unloadedPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-success/10 rounded-lg border border-success/30 text-center">
                  <CheckCircle size={28} className="mx-auto text-success mb-2" />
                  <p className="text-3xl font-bold font-display text-success tabular-nums">
                    {passQty}
                  </p>
                  <p className="text-xs text-dark-400 mt-1">合格</p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDelta('pass', 1)}
                      className="w-9 h-9 rounded bg-success/20 text-success hover:bg-success/30 text-lg font-bold transition-colors disabled:opacity-50"
                      disabled={!currentBatchId}
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleDelta('pass', -1)}
                      className="w-9 h-9 rounded bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white text-lg font-bold transition-colors disabled:opacity-50"
                      disabled={!currentBatchId || passQty === 0}
                    >
                      -
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-danger/10 rounded-lg border border-danger/30 text-center">
                  <XCircle size={28} className="mx-auto text-danger mb-2" />
                  <p className="text-3xl font-bold font-display text-danger tabular-nums">
                    {failQty}
                  </p>
                  <p className="text-xs text-dark-400 mt-1">不合格</p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDelta('fail', 1)}
                      className="w-9 h-9 rounded bg-danger/20 text-danger hover:bg-danger/30 text-lg font-bold transition-colors disabled:opacity-50"
                      disabled={!currentBatchId}
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleDelta('fail', -1)}
                      className="w-9 h-9 rounded bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white text-lg font-bold transition-colors disabled:opacity-50"
                      disabled={!currentBatchId || failQty === 0}
                    >
                      -
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-warning/10 rounded-lg border border-warning/30 text-center">
                  <RefreshCw size={28} className="mx-auto text-warning mb-2" />
                  <p className="text-3xl font-bold font-display text-warning tabular-nums">
                    {reworkQty}
                  </p>
                  <p className="text-xs text-dark-400 mt-1">返工</p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDelta('rework', 1)}
                      className="w-9 h-9 rounded bg-warning/20 text-warning hover:bg-warning/30 text-lg font-bold transition-colors disabled:opacity-50"
                      disabled={!currentBatchId}
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleDelta('rework', -1)}
                      className="w-9 h-9 rounded bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white text-lg font-bold transition-colors disabled:opacity-50"
                      disabled={!currentBatchId || reworkQty === 0}
                    >
                      -
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-dark-700/50 space-y-4">
                <div>
                  <label className="text-sm text-dark-300">不合格原因</label>
                  <select
                    value={failReason}
                    onChange={(e) => setFailReason(e.target.value)}
                    className="input-field mt-1.5"
                  >
                    <option value="">请选择原因</option>
                    <option value="膜厚不合格">膜厚不合格</option>
                    <option value="附着力不合格">附着力不合格</option>
                    <option value="外观缺陷">外观缺陷</option>
                    <option value="色差">色差</option>
                    <option value="其他">其他</option>
                  </select>
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
                <div className="flex gap-3">
                  <button
                    onClick={handleConfirm}
                    disabled={!currentBatchId}
                    className="btn-accent flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PackageCheck size={18} />
                    确认下件
                  </button>
                  <button
                    onClick={() => { setFailReason(''); setNote(''); }}
                    className="btn-outline flex-1"
                  >
                    重置表单
                  </button>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>

        <div className="space-y-6">
          <ChartCard title="下件统计" subtitle={currentBatch ? `批次: ${currentBatch.batchNo}` : '当前批次'}>
            <div className="space-y-4">
              <div className="text-center p-4 bg-primary-500/10 rounded-lg">
                <p className="text-4xl font-bold font-display text-primary-400">
                  {total > 0 ? ((passQty / total) * 100).toFixed(1) : '0.0'}%
                </p>
                <p className="text-sm text-dark-400 mt-1">合格率</p>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-dark-400">下件进度</span>
                    <span className="text-dark-200">{total}/{qty} 件</span>
                  </div>
                  <div className="h-2 bg-dark-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all"
                      style={{ width: `${unloadedPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="登记历史" subtitle="本批次下件记录">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {batchRecords.length === 0 ? (
                <p className="text-xs text-dark-500 text-center py-6">
                  暂无登记记录，点击加减按钮开始登记
                </p>
              ) : (
                batchRecords.map((r) => (
                  <div key={r.id} className="p-3 bg-dark-700/30 rounded-lg border border-dark-600/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{r.batchNo}</span>
                      <StatusBadge status={r.passRate >= 95 ? 'pass' : 'pending'} size="sm" />
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-dark-400">
                      <span className="text-success">合{r.passQty}</span>
                      <span className="text-danger">不{r.failQty}</span>
                      <span className="text-warning">返{r.reworkQty}</span>
                      <span className="ml-auto">{r.time.split(' ')[1]}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ChartCard>
        </div>
      </div>

      <ChartCard title="历史记录" subtitle="所有下件记录">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-dark-400 border-b border-dark-700/50">
                <th className="pb-3 font-medium">批次号</th>
                <th className="pb-3 font-medium">工件名称</th>
                <th className="pb-3 font-medium">总数</th>
                <th className="pb-3 font-medium">合格</th>
                <th className="pb-3 font-medium">不合格</th>
                <th className="pb-3 font-medium">返工</th>
                <th className="pb-3 font-medium">合格率</th>
                <th className="pb-3 font-medium">操作员</th>
                <th className="pb-3 font-medium">时间</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {displayRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-dark-500 text-sm">
                    暂无本批次下件记录
                  </td>
                </tr>
              ) : (
                displayRecords.map((record) => (
                  <tr key={record.id} className="border-b border-dark-700/30 hover:bg-dark-700/20">
                    <td className="py-3 font-medium text-primary-400">{record.batchNo}</td>
                    <td className="py-3 text-dark-300">{record.workpieceName}</td>
                    <td className="py-3 text-dark-200">{record.totalQty}</td>
                    <td className="py-3 text-success">{record.passQty}</td>
                    <td className="py-3 text-danger">{record.failQty}</td>
                    <td className="py-3 text-warning">{record.reworkQty}</td>
                    <td className="py-3 text-dark-200">{record.passRate}%</td>
                    <td className="py-3 text-dark-300">{record.operator}</td>
                    <td className="py-3 text-dark-400">{record.time}</td>
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

export default UnloadPage;
