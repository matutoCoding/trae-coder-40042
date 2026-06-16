import { useState, useMemo, useEffect } from 'react';
import { Package, Box, MapPin, PackagePlus, Search, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ChartCard } from '@/components/charts/ChartCard';
import BatchSelector from '@/components/ui/BatchSelector';
import StatusBadge from '@/components/ui/StatusBadge';
import { useProductionStore } from '@/store/productionStore';

function PackingPage() {
  const {
    currentBatchId,
    getCurrentBatch,
    packingRecords,
    addPackingRecord,
    startProcess,
    getProcessRecord,
  } = useProductionStore();

  const currentBatch = getCurrentBatch();
  const stepRecord = currentBatchId ? getProcessRecord(currentBatchId, 'packing') : null;
  const batchRecords = useMemo(
    () => packingRecords.filter(r => r.batchId === currentBatchId),
    [packingRecords, currentBatchId]
  );
  const latest = batchRecords[batchRecords.length - 1];

  const [packingForm, setPackingForm] = useState({
    spec: '标准木箱',
    quantity: 0,
    location: 'A区-01库位',
    operator: '',
    note: '',
  });
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    if (currentBatch) {
      setPackingForm({
        spec: latest?.spec || '标准木箱',
        quantity: latest?.quantity || currentBatch.quantity,
        location: latest?.location || 'A区-01库位',
        operator: latest?.operator || currentBatch.operator,
        note: '',
      });
    }
  }, [currentBatchId]);

  const specOptions = ['标准木箱', '纸箱', '托盘包装', '气泡膜', '定制包装'];
  const locationOptions = ['A区-01库位', 'A区-03库位', 'A区-05库位', 'B区-02库位', 'B区-04库位'];

  const stats = useMemo(() => {
    const total = packingRecords.reduce((s, r) => s + r.quantity, 0);
    const batchTotal = batchRecords.reduce((s, r) => s + r.quantity, 0);
    const locationCounts: Record<string, number> = {};
    packingRecords.forEach(r => {
      locationCounts[r.location] = (locationCounts[r.location] || 0) + r.quantity;
    });
    return {
      totalQty: total,
      batchQty: batchTotal,
      totalBatches: new Set(packingRecords.map(r => r.batchId)).size,
      locationCounts,
    };
  }, [packingRecords, batchRecords]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 2500);
  };

  const handleSubmit = () => {
    if (!currentBatchId || !currentBatch) {
      showToast('error', '请先选择批次');
      return;
    }
    if (packingForm.quantity <= 0) {
      showToast('error', '入库数量必须大于0');
      return;
    }
    if (packingForm.quantity > currentBatch.quantity) {
      showToast('error', `入库数量不能超过批次数量 ${currentBatch.quantity}`);
      return;
    }
    if (!stepRecord || stepRecord.status === 'pending') {
      startProcess(currentBatchId, 'packing', packingForm.operator);
    }
    addPackingRecord({
      batchId: currentBatchId,
      batchNo: currentBatch.batchNo,
      spec: packingForm.spec,
      quantity: packingForm.quantity,
      location: packingForm.location,
      operator: packingForm.operator,
      time: new Date().toLocaleString('zh-CN'),
    });
    showToast('success', `包装入库成功 · ${packingForm.quantity}件`);
  };

  const handleReset = () => {
    if (currentBatch) {
      setPackingForm({
        spec: '标准木箱',
        quantity: currentBatch.quantity,
        location: 'A区-01库位',
        operator: currentBatch.operator,
        note: '',
      });
    }
  };

  return (
    <div className="space-y-6">
      <BatchSelector requiredStep="packing" />

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
        <StatCard title="今日入库" value={stats.totalQty} unit="件" icon={Package} color="primary" />
        <StatCard title="包装批次" value={stats.totalBatches} unit="批" icon={Box} color="accent" />
        <StatCard title="本批次入库" value={stats.batchQty} unit="件" icon={TrendingUp} color="success" />
        <StatCard title="待包装" value={stepRecord?.status === 'pending' ? 1 : 0} unit="批" icon={PackagePlus} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title="包装入库" subtitle="产品包装与入库登记">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-dark-300">批次号</label>
                  <div className="relative mt-1.5">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                    <input
                      type="text"
                      value={currentBatch?.batchNo || ''}
                      readOnly
                      className="input-field pl-9 bg-dark-800/50"
                      placeholder="请先选择批次"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-dark-300">工件名称</label>
                  <input
                    type="text"
                    value={currentBatch?.workpieceName || ''}
                    readOnly
                    className="input-field mt-1.5 bg-dark-800/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-dark-300">批次数量</label>
                  <input
                    type="text"
                    value={currentBatch ? `${currentBatch.quantity} 件` : ''}
                    readOnly
                    className="input-field mt-1.5 bg-dark-800/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-dark-300">包装规格</label>
                  <select
                    value={packingForm.spec}
                    onChange={(e) => setPackingForm({ ...packingForm, spec: e.target.value })}
                    className="input-field mt-1.5"
                  >
                    {specOptions.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-dark-300">入库数量</label>
                  <input
                    type="number"
                    value={packingForm.quantity}
                    onChange={(e) => setPackingForm({ ...packingForm, quantity: Number(e.target.value) })}
                    className="input-field mt-1.5"
                    max={currentBatch?.quantity || 9999}
                  />
                  {currentBatch && (
                    <p className="text-xs text-dark-400 mt-1">最大可入库: {currentBatch.quantity} 件</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-dark-300">存放库位</label>
                  <select
                    value={packingForm.location}
                    onChange={(e) => setPackingForm({ ...packingForm, location: e.target.value })}
                    className="input-field mt-1.5"
                  >
                    {locationOptions.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-dark-300">操作员</label>
                  <input
                    type="text"
                    value={packingForm.operator}
                    onChange={(e) => setPackingForm({ ...packingForm, operator: e.target.value })}
                    className="input-field mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-sm text-dark-300">备注</label>
                  <textarea
                    rows={2}
                    value={packingForm.note}
                    onChange={(e) => setPackingForm({ ...packingForm, note: e.target.value })}
                    className="input-field mt-1.5 resize-none"
                    placeholder="输入备注信息..."
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-dark-700/50 flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={!currentBatchId}
                className="btn-accent flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PackagePlus size={18} />
                确认入库
              </button>
              <button onClick={handleReset} className="btn-outline flex-1">重置</button>
            </div>
          </ChartCard>
        </div>

        <div className="space-y-6">
          <ChartCard title="库存概览" subtitle="当前库存情况">
            <div className="space-y-4">
              {Object.entries(stats.locationCounts).length === 0 ? (
                <p className="text-center text-dark-500 py-8 text-sm">暂无入库数据</p>
              ) : (
                Object.entries(stats.locationCounts).map(([loc, qty], i) => (
                  <div key={loc} className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${
                        i === 0 ? 'bg-primary-500/20' : i === 1 ? 'bg-accent-500/20' : 'bg-success/20'
                      } flex items-center justify-center`}>
                        <Box size={20} className={i === 0 ? 'text-primary-400' : i === 1 ? 'text-accent-400' : 'text-success'} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{loc}</p>
                        <p className="text-xs text-dark-400">
                          {loc.startsWith('A') ? '金属件存放区' : loc.startsWith('B') ? '塑料件存放区' : '成品待发区'}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-white">{qty}件</span>
                  </div>
                ))
              )}
            </div>
          </ChartCard>

          <ChartCard title="工序状态" subtitle="当前包装工序">
            <div className="p-4 bg-dark-700/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-300">工序状态</span>
                {stepRecord ? (
                  <StatusBadge status={stepRecord.status as any} size="sm" />
                ) : (
                  <span className="text-xs text-dark-500">请选择批次</span>
                )}
              </div>
              {stepRecord && (
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-dark-400">开始时间</span>
                    <span className="text-dark-200">{stepRecord.startTime ? new Date(stepRecord.startTime).toLocaleString('zh-CN') : '--'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-400">结束时间</span>
                    <span className="text-dark-200">{stepRecord.endTime ? new Date(stepRecord.endTime).toLocaleString('zh-CN') : '--'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-400">负责人</span>
                    <span className="text-dark-200">{stepRecord.operator || '--'}</span>
                  </div>
                </div>
              )}
            </div>
          </ChartCard>
        </div>
      </div>

      <ChartCard title="入库记录" subtitle={`本批次 ${batchRecords.length} 条 · 全局 ${packingRecords.length} 条`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-dark-400 border-b border-dark-700/50">
                <th className="pb-3 font-medium">批次号</th>
                <th className="pb-3 font-medium">包装规格</th>
                <th className="pb-3 font-medium">数量</th>
                <th className="pb-3 font-medium">存放库位</th>
                <th className="pb-3 font-medium">操作员</th>
                <th className="pb-3 font-medium">入库时间</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {packingRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-dark-500 text-sm">
                    暂无入库记录
                  </td>
                </tr>
              ) : (
                packingRecords.slice().reverse().map((record) => (
                  <tr
                    key={record.id}
                    className={`border-b border-dark-700/30 transition-colors ${
                      record.batchId === currentBatchId ? 'bg-primary-500/5' : 'hover:bg-dark-700/20'
                    }`}
                  >
                    <td className="py-3 font-medium text-primary-400">{record.batchNo}</td>
                    <td className="py-3 text-dark-200">{record.spec}</td>
                    <td className="py-3 text-dark-200">{record.quantity}件</td>
                    <td className="py-3 text-dark-300">{record.location}</td>
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

export default PackingPage;
