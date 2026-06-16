import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Clock,
  User,
  CheckCircle2,
  Circle,
  PlayCircle,
  Package,
  FlaskConical,
  SprayCan,
  ThermometerSun,
  Microscope,
  PackageCheck,
  Eye,
  Filter,
} from 'lucide-react';
import { ChartCard } from '@/components/charts/ChartCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { useProductionStore } from '@/store/productionStore';
import type { Batch, ProcessRecord } from '@/types';
import { cn } from '@/lib/utils';

const stepIcons: Record<string, React.ElementType> = {
  loading: Package,
  degreasing: FlaskConical,
  phosphating: FlaskConical,
  drying: ThermometerSun,
  powder: SprayCan,
  paint: SprayCan,
  leveling: Clock,
  oven: ThermometerSun,
  thickness: Microscope,
  adhesion: Microscope,
  appearance: Eye,
  unloading: PackageCheck,
  packing: PackageCheck,
};

const stepGroups = [
  { name: '上件挂具', steps: ['loading'] },
  { name: '前处理', steps: ['degreasing', 'phosphating', 'drying'] },
  { name: '喷粉喷漆', steps: ['powder', 'paint'] },
  { name: '流平固化', steps: ['leveling', 'oven'] },
  { name: '膜厚检测', steps: ['thickness', 'adhesion', 'appearance'] },
  { name: '下件包装', steps: ['unloading', 'packing'] },
];

function formatDateTime(iso?: string) {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function StepBadge({ record }: { record: ProcessRecord }) {
  const Icon = stepIcons[record.step] || Circle;
  const statusConfig = {
    completed: { bg: 'bg-success/20', border: 'border-success', text: 'text-success', icon: CheckCircle2 },
    running: { bg: 'bg-accent-500/20', border: 'border-accent-500', text: 'text-accent-400', icon: PlayCircle },
    pending: { bg: 'bg-dark-700/50', border: 'border-dark-600', text: 'text-dark-500', icon: Circle },
    skipped: { bg: 'bg-dark-500/30', border: 'border-dark-500', text: 'text-dark-400', icon: Circle },
  };
  const config = statusConfig[record.status];
  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2.5 py-1.5 rounded-md border-2 transition-all',
        config.bg,
        config.border,
        config.text,
        record.status === 'running' && 'animate-pulse shadow-glow-accent'
      )}
    >
      <Icon size={14} />
      <span className="text-xs font-medium">{record.stepName}</span>
      {record.status === 'completed' && <StatusIcon size={12} className={config.text} />}
    </div>
  );
}

function BatchCard({ batch, expanded, onToggle, onSelect }: {
  batch: Batch;
  expanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
}) {
  const { getProcessRecords, thicknessRecords, adhesionRecords, appearanceRecords, unloadingRecords } = useProductionStore();
  const records = getProcessRecords(batch.id);
  const thickRec = thicknessRecords.find(r => r.batchId === batch.id);
  const adhRec = adhesionRecords.find(r => r.batchId === batch.id);
  const appRec = appearanceRecords.find(r => r.batchId === batch.id);
  const unloadRec = unloadingRecords.find(r => r.batchId === batch.id);

  return (
    <div className={cn(
      'card overflow-hidden transition-all duration-300',
      expanded && 'border-primary-500/50 shadow-glow-primary'
    )}>
      <div
        className="p-4 cursor-pointer hover:bg-dark-700/30 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {expanded ? (
              <ChevronDown size={20} className="text-primary-400" />
            ) : (
              <ChevronRight size={20} className="text-dark-400" />
            )}
            <div>
              <div className="flex items-center gap-3">
                <span className="text-primary-400 font-semibold font-display tracking-wide">{batch.batchNo}</span>
                <StatusBadge status={batch.status as any} size="sm" />
              </div>
              <p className="text-sm text-dark-300 mt-0.5">{batch.workpieceName} · {batch.workpieceType} · {batch.quantity}件</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-xs text-dark-400">挂具</p>
              <p className="text-sm text-dark-200">{batch.hangerName}</p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-xs text-dark-400">操作员</p>
              <p className="text-sm text-dark-200">{batch.operator}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              className="btn-outline text-sm py-1.5 px-3"
            >
              进入工序
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {records.slice(0, 8).map(rec => (
            <StepBadge key={rec.step} record={rec} />
          ))}
          {records.length > 8 && (
            <span className="flex items-center gap-1 px-2 py-1.5 text-xs text-dark-400">
              +{records.length - 8} 更多
            </span>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-dark-700/50 p-5 bg-dark-900/40 animate-slide-up">
          <h4 className="text-sm font-semibold text-dark-200 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-primary-400" />
            完整涂装履历
          </h4>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {stepGroups.map(group => (
              <div key={group.name} className="p-4 bg-dark-800/40 rounded-lg border border-dark-700/30">
                <h5 className="text-sm font-medium text-dark-100 mb-3 pb-2 border-b border-dark-700/30">
                  {group.name}
                </h5>
                <div className="space-y-2">
                  {group.steps.map(stepKey => {
                    const rec = records.find(r => r.step === stepKey);
                    if (!rec) return null;
                    return (
                      <div key={stepKey} className="flex items-start gap-3 py-1.5">
                        <div className={cn(
                          'mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
                          rec.status === 'completed' ? 'bg-success/20' :
                          rec.status === 'running' ? 'bg-accent-500/20 animate-pulse' :
                          'bg-dark-700/50'
                        )}>
                          {rec.status === 'completed' ? (
                            <CheckCircle2 size={12} className="text-success" />
                          ) : rec.status === 'running' ? (
                            <PlayCircle size={12} className="text-accent-400" />
                          ) : (
                            <Circle size={12} className="text-dark-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              'text-sm font-medium',
                              rec.status === 'completed' ? 'text-dark-100' :
                              rec.status === 'running' ? 'text-accent-400' :
                              'text-dark-500'
                            )}>
                              {rec.stepName}
                            </span>
                            {rec.result && (
                              <StatusBadge status={rec.result as any} text={rec.result === 'pass' ? '合格' : '不合格'} size="sm" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-dark-500">
                            {rec.operator && (
                              <span className="flex items-center gap-1">
                                <User size={10} />
                                {rec.operator}
                              </span>
                            )}
                            {rec.startTime && (
                              <span className="flex items-center gap-1">
                                <Clock size={10} />
                                {formatDateTime(rec.startTime)} ~ {formatDateTime(rec.endTime)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {thickRec && (
              <div className="p-3 bg-success/5 rounded-lg border border-success/20">
                <p className="text-xs text-dark-400 mb-1">漆膜厚度检测</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold font-display text-success">{thickRec.average}μm</span>
                  <span className="text-xs text-dark-400">/ 目标 {thickRec.target}μm</span>
                </div>
              </div>
            )}
            {adhRec && (
              <div className="p-3 bg-primary-500/5 rounded-lg border border-primary-500/20">
                <p className="text-xs text-dark-400 mb-1">附着力等级</p>
                <p className={cn(
                  'text-xl font-bold font-display',
                  adhRec.grade <= 1 ? 'text-success' : adhRec.grade <= 2 ? 'text-warning' : 'text-danger'
                )}>
                  {adhRec.grade} 级
                </p>
              </div>
            )}
            {appRec && (
              <div className="p-3 bg-accent-500/5 rounded-lg border border-accent-500/20">
                <p className="text-xs text-dark-400 mb-1">外观等级</p>
                <p className="text-xl font-bold font-display text-accent-400">{appRec.grade} 级</p>
              </div>
            )}
            {unloadRec && (
              <div className="p-3 bg-info/5 rounded-lg border border-info/20">
                <p className="text-xs text-dark-400 mb-1">下件统计</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold font-display text-info">{unloadRec.passQty}</span>
                  <span className="text-xs text-dark-400">/ {unloadRec.totalQty} 件合格</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FlowBoardPage() {
  const { batches, currentBatchId, setCurrentBatchId, getBatchProcessStats } = useProductionStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const stats = getBatchProcessStats();
  const statsCards = [
    { label: '总批次', value: stats.total, color: 'text-primary-400' },
    { label: '上件中', value: stats.loading, color: 'text-info' },
    { label: '前处理', value: stats.pretreatment, color: 'text-accent-400' },
    { label: '喷涂中', value: stats.spraying, color: 'text-warning' },
    { label: '固化中', value: stats.curing, color: 'text-danger' },
    { label: '检测中', value: stats.inspection, color: 'text-purple-400' },
    { label: '已完成', value: stats.finished, color: 'text-success' },
  ];

  const filteredBatches = statusFilter === 'all'
    ? batches
    : batches.filter(b => b.status === statusFilter);

  const handleSelect = (id: string) => {
    setCurrentBatchId(id);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {statsCards.map((s, i) => (
          <div
            key={s.label}
            onClick={() => setStatusFilter(i === 0 ? 'all' : ['loading', 'pretreatment', 'spraying', 'curing', 'inspection', 'finished'][i - 1])}
            className={cn(
              'card p-4 cursor-pointer transition-all hover:-translate-y-0.5',
              statusFilter === (i === 0 ? 'all' : ['loading', 'pretreatment', 'spraying', 'curing', 'inspection', 'finished'][i - 1])
                ? 'border-primary-500/50 shadow-glow-primary'
                : ''
            )}
          >
            <p className="text-xs text-dark-400">{s.label}</p>
            <p className={cn('text-2xl font-bold font-display mt-1', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      <ChartCard
        title="生产批次流转看板"
        subtitle="点击批次可展开完整涂装履历"
        action={
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dark-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field text-sm pl-8 pr-8 py-1.5"
              >
                <option value="all">全部状态</option>
                <option value="loading">上件中</option>
                <option value="pretreatment">前处理</option>
                <option value="spraying">喷涂中</option>
                <option value="curing">固化中</option>
                <option value="inspection">检测中</option>
                <option value="finished">已完成</option>
              </select>
            </div>
          </div>
        }
      >
        <div className="space-y-3">
          {filteredBatches.length === 0 ? (
            <div className="py-16 text-center text-dark-500">
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              <p>暂无批次数据</p>
            </div>
          ) : (
            filteredBatches.map(batch => (
              <BatchCard
                key={batch.id}
                batch={batch}
                expanded={expandedId === batch.id}
                onToggle={() => setExpandedId(expandedId === batch.id ? null : batch.id)}
                onSelect={() => handleSelect(batch.id)}
              />
            ))
          )}
        </div>
      </ChartCard>

      {currentBatchId && (
        <div className="card p-4 border-primary-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              <span className="text-sm text-dark-300">当前选中批次:</span>
              <span className="text-primary-400 font-semibold font-display">
                {batches.find(b => b.id === currentBatchId)?.batchNo}
              </span>
              <span className="text-dark-400">
                {batches.find(b => b.id === currentBatchId)?.workpieceName}
              </span>
            </div>
            <div className="text-xs text-dark-500">
              💡 左侧菜单点击任意工序页面即可查看当前批次详情
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlowBoardPage;
