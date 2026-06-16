import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Package, Layers, Clock, User, X, Check, ChevronDown } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ChartCard } from '@/components/charts/ChartCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { useProductionStore } from '@/store/productionStore';

const workpieceTypes = ['金属件', '塑料件', '铝合金', '不锈钢', '复合材料'];
const operators = ['张工', '李工', '王工', '赵工', '孙工', '周工', '吴工'];

function LoadingPage() {
  const {
    batches,
    hangers,
    currentBatchId,
    setCurrentBatchId,
    addBatch,
    hangers: hangerList,
    getProcessRecords,
  } = useProductionStore();

  const [activeTab, setActiveTab] = useState<'batch' | 'hanger'>('batch');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    workpieceName: '',
    workpieceType: '金属件',
    quantity: 50,
    hangerId: '',
    operator: '张工',
  });

  const availableHangers = hangerList.filter(h => h.status === 'available');

  const handleSubmit = () => {
    if (!formData.workpieceName || !formData.hangerId) {
      alert('请填写完整信息：工件名称和挂具');
      return;
    }
    const hanger = hangers.find(h => h.id === formData.hangerId);
    addBatch({
      workpieceName: formData.workpieceName,
      workpieceType: formData.workpieceType,
      quantity: formData.quantity,
      hangerId: formData.hangerId,
      hangerName: hanger?.name || '',
      operator: formData.operator,
    });
    setShowAddModal(false);
    setFormData({
      workpieceName: '',
      workpieceType: '金属件',
      quantity: 50,
      hangerId: '',
      operator: '张工',
    });
  };

  const handleSelectBatch = (id: string) => {
    setCurrentBatchId(id);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="今日上件批次" value={batches.length} unit="批" icon={Package} color="primary" />
        <StatCard
          title="今日上件数量"
          value={batches.reduce((s, b) => s + b.quantity, 0)}
          unit="件"
          icon={Package}
          color="accent"
        />
        <StatCard
          title="在用挂具"
          value={hangers.filter(h => h.status === 'in-use').length}
          unit="个"
          icon={Layers}
          color="success"
        />
        <StatCard
          title="可用挂具"
          value={hangers.filter(h => h.status === 'available').length}
          unit="个"
          icon={User}
          color="warning"
        />
      </div>

      {/* 当前批次信息卡片 */}
      {currentBatchId && (
        <div className="card p-4 border-primary-500/30 bg-primary-500/5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <Package size={20} className="text-primary-400" />
              </div>
              <div>
                <p className="text-xs text-dark-400">当前选中批次</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-primary-400 font-semibold font-display tracking-wide">
                    {batches.find(b => b.id === currentBatchId)?.batchNo}
                  </span>
                  <span className="text-dark-200">
                    {batches.find(b => b.id === currentBatchId)?.workpieceName}
                  </span>
                  <StatusBadge
                    status={batches.find(b => b.id === currentBatchId)?.status || 'loading'}
                    size="sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-dark-400">数量：</span>
                <span className="text-dark-100">{batches.find(b => b.id === currentBatchId)?.quantity} 件</span>
              </div>
              <div>
                <span className="text-dark-400">挂具：</span>
                <span className="text-dark-100">{batches.find(b => b.id === currentBatchId)?.hangerName}</span>
              </div>
              <div>
                <span className="text-dark-400">操作员：</span>
                <span className="text-dark-100">{batches.find(b => b.id === currentBatchId)?.operator}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-dark-700/50">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('batch')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'batch'
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
              }`}
            >
              批次管理
            </button>
            <button
              onClick={() => setActiveTab('hanger')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'hanger'
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
              }`}
            >
              挂具管理
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                placeholder="搜索批次号..."
                className="pl-9 pr-3 py-1.5 w-48 bg-dark-800/50 border border-dark-600/50 rounded-lg text-sm text-dark-200 placeholder-dark-500 focus:outline-none focus:border-primary-500/50"
              />
            </div>
            <button className="btn-outline flex items-center gap-1.5 text-sm py-1.5">
              <Filter size={16} />
              筛选
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-accent flex items-center gap-1.5 text-sm py-1.5"
            >
              <Plus size={16} />
              新增批次
            </button>
          </div>
        </div>

        <div className="p-5">
          {activeTab === 'batch' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-dark-400 border-b border-dark-700/50">
                    <th className="pb-3 font-medium">批次号</th>
                    <th className="pb-3 font-medium">工件名称</th>
                    <th className="pb-3 font-medium">类型</th>
                    <th className="pb-3 font-medium">数量</th>
                    <th className="pb-3 font-medium">挂具</th>
                    <th className="pb-3 font-medium">状态</th>
                    <th className="pb-3 font-medium">操作员</th>
                    <th className="pb-3 font-medium">开始时间</th>
                    <th className="pb-3 font-medium">工序进度</th>
                    <th className="pb-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {batches.map((batch) => {
                    const records = getProcessRecords(batch.id);
                    const completedSteps = records.filter(r => r.status === 'completed').length;
                    const progress = (completedSteps / records.length) * 100;
                    return (
                      <tr
                        key={batch.id}
                        onClick={() => handleSelectBatch(batch.id)}
                        className={`border-b border-dark-700/30 cursor-pointer transition-colors ${
                          currentBatchId === batch.id
                            ? 'bg-primary-500/10'
                            : 'hover:bg-dark-700/20'
                        }`}
                      >
                        <td className="py-3 font-medium text-primary-400">{batch.batchNo}</td>
                        <td className="py-3 text-dark-200">{batch.workpieceName}</td>
                        <td className="py-3 text-dark-400">{batch.workpieceType}</td>
                        <td className="py-3 text-dark-200">{batch.quantity} 件</td>
                        <td className="py-3 text-dark-300">{batch.hangerName}</td>
                        <td className="py-3">
                          <StatusBadge status={batch.status as any} size="sm" />
                        </td>
                        <td className="py-3 text-dark-300">{batch.operator}</td>
                        <td className="py-3 text-dark-400">
                          {new Date(batch.startTime).toLocaleString('zh-CN', {
                            month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-dark-400">{completedSteps}/{records.length}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSelectBatch(batch.id); }}
                              className={`p-1 rounded transition-colors ${
                                currentBatchId === batch.id
                                  ? 'bg-primary-500/20 text-primary-400'
                                  : 'text-dark-400 hover:text-white hover:bg-dark-700'
                              }`}
                              title="选中此批次"
                            >
                              {currentBatchId === batch.id ? <Check size={16} /> : <MoreHorizontal size={18} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hangers.map((hanger) => (
                <div
                  key={hanger.id}
                  className="p-4 rounded-lg bg-dark-700/30 border border-dark-600/30 hover:border-primary-500/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-primary-500/10 text-primary-400">
                        <Layers size={24} />
                      </div>
                      <div>
                        <p className="font-medium text-white">{hanger.name}</p>
                        <p className="text-xs text-dark-400">{hanger.type}</p>
                      </div>
                    </div>
                    <StatusBadge status={hanger.status as any} size="sm" />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-dark-400 text-xs">承重</p>
                      <p className="text-dark-200 font-medium">{hanger.capacity} 件</p>
                    </div>
                    <div>
                      <p className="text-dark-400 text-xs">使用次数</p>
                      <p className="text-dark-200 font-medium">{hanger.useCount} 次</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-dark-600/30 flex items-center justify-between">
                    <span className="text-xs text-dark-500">上次维护: {hanger.lastMaintenance}</span>
                    <button className="text-xs text-primary-400 hover:text-primary-300">详情</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 新增批次弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-lg mx-4 animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-dark-700/50">
              <h3 className="text-lg font-semibold text-dark-100 font-display">新增上件批次</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700/50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm text-dark-300 block mb-1.5">
                  工件名称 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.workpieceName}
                  onChange={(e) => setFormData({ ...formData, workpieceName: e.target.value })}
                  className="input-field"
                  placeholder="请输入工件名称，如：汽车保险杠"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dark-300 block mb-1.5">工件类型</label>
                  <div className="relative">
                    <select
                      value={formData.workpieceType}
                      onChange={(e) => setFormData({ ...formData, workpieceType: e.target.value })}
                      className="input-field appearance-none pr-9"
                    >
                      {workpieceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-dark-300 block mb-1.5">数量（件）</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-dark-300 block mb-1.5">
                  选择挂具 <span className="text-danger">*</span>
                  {availableHangers.length === 0 && (
                    <span className="ml-2 text-xs text-warning">（暂无可使用挂具）</span>
                  )}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableHangers.length === 0 ? (
                    <p className="col-span-2 text-xs text-dark-500 py-4 text-center bg-dark-800/50 rounded-lg">
                      所有挂具均在使用中，请等待挂具释放
                    </p>
                  ) : (
                    availableHangers.map(h => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, hangerId: h.id })}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          formData.hangerId === h.id
                            ? 'border-accent-500 bg-accent-500/10'
                            : 'border-dark-600/50 bg-dark-800/30 hover:border-dark-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-dark-100">{h.name}</span>
                          {formData.hangerId === h.id && (
                            <Check size={14} className="text-accent-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-dark-400">
                          <span>{h.type}</span>
                          <span>承重: {h.capacity}件</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm text-dark-300 block mb-1.5">操作员</label>
                <div className="relative">
                  <select
                    value={formData.operator}
                    onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                    className="input-field appearance-none pr-9"
                  >
                    {operators.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-5 border-t border-dark-700/50">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-outline flex-1"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={availableHangers.length === 0}
                className="btn-accent flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认登记上件
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoadingPage;
