import { useMemo, useState } from 'react';
import { Package, ChevronDown, Check, Clock, User, Layers } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useProductionStore } from '@/store/productionStore';

interface Props {
  requiredStep?: string;
}

function BatchSelector({ requiredStep }: Props) {
  const {
    batches,
    currentBatchId,
    setCurrentBatchId,
    getProcessRecords,
  } = useProductionStore();

  const [open, setOpen] = useState(false);

  const currentBatch = useMemo(
    () => batches.find(b => b.id === currentBatchId),
    [batches, currentBatchId]
  );

  const currentStepRecord = useMemo(() => {
    if (!currentBatch || !requiredStep) return null;
    const records = getProcessRecords(currentBatch.id);
    return records.find(r => r.step === requiredStep);
  }, [currentBatch, requiredStep, getProcessRecords]);

  return (
    <div className="card p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
            <Package size={20} className="text-primary-400" />
          </div>
          <div className="relative">
            <button
              onClick={() => setOpen(o => !o)}
              className="flex items-center gap-3 pr-2 group"
            >
              <div className="text-left">
                <div className="flex items-center gap-2.5">
                  <span className="text-primary-400 font-semibold font-display tracking-wide text-lg">
                    {currentBatch?.batchNo || '请选择批次'}
                  </span>
                  <span className="text-dark-300 text-sm">
                    {currentBatch?.workpieceName}
                  </span>
                  {currentBatch && (
                    <StatusBadge status={currentBatch.status as any} size="sm" />
                  )}
                </div>
                <div className="flex items-center gap-4 mt-0.5 text-xs text-dark-400">
                  {currentBatch ? (
                    <>
                      <span className="flex items-center gap-1">
                        <Layers size={12} />
                        {currentBatch.hangerName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package size={12} />
                        {currentBatch.quantity}件
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {currentBatch.operator}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(currentBatch.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </>
                  ) : (
                    <span className="text-warning text-xs">
                      未选择批次，无法登记工序数据
                    </span>
                  )}
                </div>
              </div>
              <ChevronDown
                size={18}
                className={`text-dark-400 group-hover:text-white transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </button>

            {open && (
              <div className="absolute top-full left-0 mt-2 w-96 max-h-80 overflow-y-auto card z-50 p-2 animate-slide-up">
                <p className="text-xs text-dark-400 px-2 py-1.5 border-b border-dark-700/50 mb-1">
                  点击选择批次进行后续工序
                </p>
                {batches.length === 0 ? (
                  <p className="text-center text-dark-500 text-sm py-6">
                    暂无可选批次，请到上件挂具页面新增
                  </p>
                ) : (
                  batches.map(b => {
                    const records = getProcessRecords(b.id);
                    const completed = records.filter(r => r.status === 'completed').length;
                    return (
                      <button
                        key={b.id}
                        onClick={() => { setCurrentBatchId(b.id); setOpen(false); }}
                        className={`w-full text-left p-2.5 rounded-lg transition-colors ${
                          currentBatchId === b.id
                            ? 'bg-primary-500/15 border border-primary-500/30'
                            : 'hover:bg-dark-700/50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-dark-100">{b.batchNo}</span>
                            <span className="text-dark-300 text-sm">{b.workpieceName}</span>
                          </div>
                          {currentBatchId === b.id && (
                            <Check size={14} className="text-primary-400" />
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="flex items-center gap-3 text-xs text-dark-400">
                            <span>{b.quantity}件</span>
                            <span>{b.hangerName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1 bg-dark-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
                                style={{ width: `${(completed / records.length) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-dark-400">{completed}/{records.length}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {requiredStep && currentStepRecord && (
          <div className="flex items-center gap-6 text-sm pr-2">
            <div>
              <span className="text-dark-400 text-xs">当前工序状态：</span>
              <span className="ml-2">
                {currentStepRecord.status === 'completed' && (
                  <span className="text-success flex items-center gap-1">
                    <Check size={14} /> 已完成
                  </span>
                )}
                {currentStepRecord.status === 'running' && (
                  <span className="text-accent flex items-center gap-1">
                    <Clock size={14} /> 进行中
                  </span>
                )}
                {currentStepRecord.status === 'pending' && (
                  <span className="text-dark-400">待开始</span>
                )}
              </span>
            </div>
            {currentStepRecord.operator && (
              <div>
                <span className="text-dark-400 text-xs">负责人：</span>
                <span className="ml-1 text-dark-200">{currentStepRecord.operator}</span>
              </div>
            )}
            {currentStepRecord.startTime && (
              <div>
                <span className="text-dark-400 text-xs">开始：</span>
                <span className="ml-1 text-dark-200">
                  {new Date(currentStepRecord.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BatchSelector;
