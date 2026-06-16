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
    storageLocations,
    getStorageAvailable,
  } = useProductionStore();

  const currentBatch = getCurrentBatch();
  const stepRecord = currentBatchId ? getProcessRecord(currentBatchId, 'packing') : null;
  const batchRecords = useMemo(
    () => packingRecords.filter(r => r.batchId === currentBatchId),
    [packingRecords, currentBatchId]
  );
  const latest = batchRecords[batchRecords.length - 1];

  const batchPackedQty = useMemo(
    () => batchRecords.reduce((s, r) => s + r.quantity, 0),
    [batchRecords]
  );
  const remainingQty = currentBatch ? Math.max(currentBatch.quantity - batchPackedQty, 0) : 0;

  const [packingForm, setPackingForm] = useState({
    spec: '标准木箱',
    quantity: 0,
    location: 'A区-01库位',
    operator: '',
    note: '',
  });
  const [showAllRecords, setShowAllRecords] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    if (currentBatch) {
      setPackingForm({
        spec: latest?.spec || '标准木箱',
        quantity: Math.min(remainingQty || currentBatch.quantity, currentBatch.quantity),
        location: latest?.location || 'A区-01库位',
        operator: latest?.operator || currentBatch.operator,
        note: '',
      });
    }
    setShowAllRecords(false);
  }, [currentBatchId]);

  const specOptions = ['标准木箱', '纸箱', '托盘包装', '气泡膜', '定制包装'];

  const currentLocation = useMemo(() => 
    storageLocations.find(loc => loc.name === packingForm.location),
    [storageLocations, packingForm.location]
  );

  const stats = useMemo(() => {
    const totalQty = packingRecords.reduce((s, r) => s + r.quantity, 0);
    const locationCounts: Record<string, number> = {};
    packingRecords.forEach(r => {
      locationCounts[r.location] = (locationCounts[r.location] || 0) + r.quantity;
    });
    return {
      totalQty,
      batchQty: batchPackedQty,
      totalBatches: new Set(packingRecords.map(r => r.batchId)).size,
      locationCounts,
    };
  }, [packingRecords, batchPackedQty]);

  const areaStats = useMemo(() => {
    const areas: Record<string, { name: string; used: number; capacity: number; type: string }> = {};
    storageLocations.forEach(loc => {
      if (!areas[loc.area]) {
        areas[loc.area] = {
          name: `${loc.area}区`,
          used: 0,
          capacity: 0,
          type: loc.type,
        };
      }
      areas[loc.area].used += loc.used;
      areas[loc.area].capacity += loc.capacity;
    });
    return Object.values(areas).sort((a, b) => a.name.localeCompare(b.name));
  }, [storageLocations]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 2500);
  };

  const handleSubmit = () => {
    if (!currentBatchId || !currentBatch) {
      showToast('error', '请先选择批次');
      return;
    }
    if (stepRecord?.status === 'completed') {
      showToast('error', '本批次包装已完成，无需重复入库');
      return;
    }
    if (packingForm.quantity <= 0) {
      showToast('error', '入库数量必须大于0');
      return;
    }
    if (packingForm.quantity > remainingQty) {
      showToast('error', `本批次剩余可入库 ${remainingQty} 件，本次入库 ${packingForm.quantity} 件将超量`);
      return;
    }
    const storageAvailable = getStorageAvailable(packingForm.location);
    if (storageAvailable < packingForm.quantity) {
      showToast('error', `库位剩余容量不足，剩余 ${storageAvailable} 件`);
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
    const newRemaining = remainingQty - packingForm.quantity;
    const isJustCompleted = newRemaining === 0;
    showToast('success', isJustCompleted
      ? `批次 ${currentBatch.batchNo} 入库完成 · 全部 ${currentBatch.quantity} 件已入库`
      : `已入库 ${packingForm.quantity} 件，剩余 ${newRemaining} 件待入库`
    );
    setPackingForm(f => ({ ...f, quantity: newRemaining, note: '' }));
  };

  const handleReset = () => {
    if (currentBatch) {
      setPackingForm({
        spec: '标准木箱',
        quantity: remainingQty || currentBatch.quantity,
        location: 'A区-01库位',
        operator: currentBatch.operator,
        note: '',
      });
    }
  };

  const tableRecords = showAllRecords ? packingRecords : batchRecords;

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
        <StatCard title="批次总数量" value={currentBatch?.quantity ?? 0} unit="件" icon={Package} color="primary" />
        <StatCard title="本批次已入库" value={stats.batchQty} unit="件" icon={TrendingUp} color="success" />
        <StatCard title="本批次待入库" value={remainingQty} unit="件" icon={PackagePlus} color="warning" />
        <StatCard title="包装总批次数" value={stats.totalBatches} unit="批" icon={Box} color="accent" />
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
                  <label className="text-sm text-dark-300">入库进度</label>
                  <div className="mt-1.5 flex items-center gap-3">
                    <p className="text-lg font-medium text-white">
                      <span className="text-primary-400">{stats.batchQty}</span>
                      <span className="mx-2 text-dark-500">/</span>
                      <span className="text-dark-200">{currentBatch?.quantity ?? 0} 件</span>
                    </p>
                  </div>
                  <div className="h-1.5 mt-1.5 bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all"
                      style={{ width: `${currentBatch && currentBatch.quantity > 0 ? (stats.batchQty / currentBatch.quantity) * 100 : 0}%` }}
                    />
                  </div>
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
                  <label className="text-sm text-dark-300">本次入库数量</label>
                  <input
                    type="number"
                    value={packingForm.quantity}
                    onChange={(e) => setPackingForm({ ...packingForm, quantity: Number(e.target.value) })}
                    className="input-field mt-1.5"
                    max={remainingQty}
                    min={0}
                  />
                  <p className="text-xs text-dark-400 mt-1">
                    本次最多可入库: <span className="text-warning font-medium">{remainingQty}</span> 件
                    {remainingQty === 0 && currentBatch && stepRecord?.status !== 'completed' && (
                      <span className="ml-2 text-success">（数量对齐后将自动完成包装节点）</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-dark-300">存放库位</label>
                  <select
                    value={packingForm.location}
                    onChange={(e) => {
                      const newLocation = e.target.value;
                      const available = getStorageAvailable(newLocation);
                      const newQty = Math.min(available, remainingQty);
                      setPackingForm({ ...packingForm, location: newLocation, quantity: newQty });
                    }}
                    className="input-field mt-1.5"
                  >
                    {storageLocations.map((loc) => {
                      const isFull = loc.capacity - loc.used <= 0;
                      return (
                        <option key={loc.id} value={loc.name} disabled={isFull}>
                          {loc.name}{isFull ? '（已满）' : ''}
                        </option>
                      );
                    })}
                  </select>
                  {currentLocation && (
                    <p className="text-xs text-dark-400 mt-1.5">
                      容量 <span className="text-white font-medium">{currentLocation.capacity}</span> 件
                      <span className="mx-1.5">·</span>
                      已用 <span className="text-warning font-medium">{currentLocation.used}</span> 件
                      <span className="mx-1.5">·</span>
                      剩余 <span className="text-success font-medium">{currentLocation.capacity - currentLocation.used}</span> 件
                    </p>
                  )}
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
                disabled={!currentBatchId || remainingQty === 0}
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
          <ChartCard title="库存概览" subtitle="按库区统计">
            <div className="space-y-4">
              {areaStats.length === 0 ? (
                <p className="text-center text-dark-500 py-8 text-sm">暂无库位数据</p>
              ) : (
                areaStats.map((area, i) => {
                  const percent = area.capacity > 0 ? (area.used / area.capacity) * 100 : 0;
                  const remaining = area.capacity - area.used;
                  return (
                    <div key={area.name} className="p-3 bg-dark-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${
                            i === 0 ? 'bg-primary-500/20' : i === 1 ? 'bg-accent-500/20' : 'bg-success/20'
                          } flex items-center justify-center`}>
                            <Box size={20} className={i === 0 ? 'text-primary-400' : i === 1 ? 'text-accent-400' : 'text-success'} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{area.name}</p>
                            <p className="text-xs text-dark-400">
                              {area.type}存放区
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-dark-300">剩余 <span className="text-success font-medium">{remaining}</span> 件</span>
                      </div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-dark-400">
                          已用 <span className="text-white font-medium">{area.used}</span> / 容量 <span className="text-white font-medium">{area.capacity}</span>
                        </span>
                        <span className="text-dark-300">{percent.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
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

      <ChartCard
        title="入库记录"
        subtitle={showAllRecords ? `全局共 ${packingRecords.length} 条` : `本批次 ${batchRecords.length} 条`}
        action={
          <button
            onClick={() => setShowAllRecords(!showAllRecords)}
            className={`text-xs px-3 py-1.5 rounded transition-colors ${
              showAllRecords ? 'bg-primary-500 text-white' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
            }`}
          >
            {showAllRecords ? '只看当前批次' : '查看全部记录'}
          </button>
        }
      >
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
              {tableRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-dark-500 text-sm">
                    暂无入库记录
                  </td>
                </tr>
              ) : (
                tableRecords.slice().reverse().map((record) => (
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
