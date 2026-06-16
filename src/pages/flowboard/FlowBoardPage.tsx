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
  X,
  FileText,
  Copy,
  Check,
  History,
  ScrollText,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { ChartCard } from '@/components/charts/ChartCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { useProductionStore } from '@/store/productionStore';
import type { Batch, ProcessRecord, ProcessStep } from '@/types';
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

function BatchCard({ batch, expanded, onToggle, onSelect, onViewHistory }: {
  batch: Batch;
  expanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onViewHistory: () => void;
}) {
  const { getProcessRecords, thicknessRecords, adhesionRecords, appearanceRecords, unloadingRecords, getReworkCount } = useProductionStore();
  const records = getProcessRecords(batch.id);
  const thickRec = thicknessRecords.find(r => r.batchId === batch.id);
  const adhRec = adhesionRecords.find(r => r.batchId === batch.id);
  const appRec = appearanceRecords.find(r => r.batchId === batch.id);
  const unloadRec = unloadingRecords.find(r => r.batchId === batch.id);
  const reworkCount = getReworkCount(batch.id);

  return (
    <div className={cn(
      'card overflow-hidden transition-all duration-300',
      expanded && 'border-primary-500/50 shadow-glow-primary'
    )}>
      <div
        className="p-4 cursor-pointer hover:bg-dark-700/30 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between relative">
          {reworkCount > 0 && (
            <div className="absolute -top-1 -right-1 z-10">
              <span className="bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                返工 {reworkCount} 次
              </span>
            </div>
          )}
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

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-xs text-dark-400">挂具</p>
              <p className="text-sm text-dark-200">{batch.hangerName}</p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-xs text-dark-400">操作员</p>
              <p className="text-sm text-dark-200">{batch.operator}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onViewHistory(); }}
              className="btn-outline text-sm py-1.5 px-3 flex items-center gap-1.5"
            >
              <History size={14} />
              查看履历
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              className="btn-primary text-sm py-1.5 px-3"
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
  const {
    batches,
    currentBatchId,
    setCurrentBatchId,
    getBatchProcessStats,
    getProcessRecords,
    getProcessRecord,
    thicknessRecords,
    adhesionRecords,
    appearanceRecords,
    unloadingRecords,
    packingRecords,
    reworkRecords,
    getReworkCount,
    startRework,
    completeRework,
  } = useProductionStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [drawerBatchId, setDrawerBatchId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showReworkModal, setShowReworkModal] = useState(false);
  const [reworkReason, setReworkReason] = useState('');
  const [reworkStep, setReworkStep] = useState<string>('degreasing');
  const [reworkOperator, setReworkOperator] = useState('');
  const [reworkNote, setReworkNote] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const stats = getBatchProcessStats();
  const statsCards = [
    { label: '总批次', value: stats.total, color: 'text-primary-400', filter: 'all' },
    { label: '上件中', value: stats.loading, color: 'text-info', filter: 'loading' },
    { label: '前处理', value: stats.pretreatment, color: 'text-accent-400', filter: 'pretreatment' },
    { label: '喷涂中', value: stats.spraying, color: 'text-warning', filter: 'spraying' },
    { label: '固化中', value: stats.curing, color: 'text-danger', filter: 'curing' },
    { label: '检测中', value: stats.inspection, color: 'text-purple-400', filter: 'inspection' },
    { label: '下件中', value: stats.unloading, color: 'text-cyan-400', filter: 'unloading' },
    { label: '包装中', value: stats.packing, color: 'text-orange-400', filter: 'packing' },
    { label: '返工中', value: stats.rework, color: 'text-danger', filter: 'rework' },
    { label: '已完成', value: stats.finished, color: 'text-success', filter: 'finished' },
  ];

  const filteredBatches = statusFilter === 'all'
    ? batches
    : batches.filter(b => b.status === statusFilter);

  const handleSelect = (id: string) => {
    setCurrentBatchId(id);
  };

  const drawerBatch = batches.find(b => b.id === drawerBatchId);
  const drawerRecords = drawerBatchId ? getProcessRecords(drawerBatchId) : [];
  const drawerThickness = drawerBatchId ? thicknessRecords.filter(r => r.batchId === drawerBatchId) : [];
  const drawerAdhesion = drawerBatchId ? adhesionRecords.filter(r => r.batchId === drawerBatchId) : [];
  const drawerAppearance = drawerBatchId ? appearanceRecords.filter(r => r.batchId === drawerBatchId) : [];
  const drawerUnloading = drawerBatchId ? unloadingRecords.find(r => r.batchId === drawerBatchId) : undefined;
  const drawerPacking = drawerBatchId ? packingRecords.filter(r => r.batchId === drawerBatchId) : [];
  const drawerRework = drawerBatchId ? reworkRecords.filter(r => r.batchId === drawerBatchId) : [];

  const generateTraceReport = (): string => {
    if (!drawerBatch) return '';
    const lines: string[] = [];
    lines.push('========================================');
    lines.push('       喷 涂 生 产 追 溯 单');
    lines.push('========================================');
    lines.push('');
    lines.push('【批次基本信息】');
    lines.push(`  批次号: ${drawerBatch.batchNo}`);
    lines.push(`  工件名称: ${drawerBatch.workpieceName}`);
    lines.push(`  工件类型: ${drawerBatch.workpieceType}`);
    lines.push(`  数量: ${drawerBatch.quantity} 件`);
    lines.push(`  挂具: ${drawerBatch.hangerName}`);
    lines.push(`  操作员: ${drawerBatch.operator}`);
    lines.push(`  开始时间: ${formatDateTime(drawerBatch.startTime)}`);
    lines.push(`  当前状态: ${drawerBatch.status}`);
    lines.push(`  返工次数: ${getReworkCount(drawerBatch.id)} 次`);
    lines.push('');
    lines.push('【工序流程表】');
    lines.push('  序号  工序名称        状态      开始时间        结束时间        负责人  结果');
    lines.push('  ----  --------------  --------  --------------  --------------  ------  ------');
    drawerRecords.forEach((rec, idx) => {
      const statusText = rec.status === 'completed' ? '已完成' : rec.status === 'running' ? '进行中' : '待处理';
      const resultText = rec.result ? (rec.result === 'pass' ? '合格' : '不合格') : '-';
      lines.push(`  ${String(idx + 1).padStart(2, '0')}    ${rec.stepName.padEnd(12, ' ')}  ${statusText.padEnd(6, ' ')}  ${formatDateTime(rec.startTime).padEnd(14, ' ')}  ${formatDateTime(rec.endTime).padEnd(14, ' ')}  ${(rec.operator || '-').padEnd(6, ' ')}  ${resultText}`);
      if (rec.note) {
        lines.push(`        备注: ${rec.note}`);
      }
    });
    lines.push('');
    lines.push('【质检明细】');
    lines.push('');
    lines.push('  ▶ 漆膜厚度检测');
    if (drawerThickness.length === 0) {
      lines.push('    暂无记录');
    } else {
      drawerThickness.forEach((rec, i) => {
        lines.push(`    [${i + 1}] 时间: ${rec.time}`);
        lines.push(`        检测员: ${rec.inspector}`);
        lines.push(`        均值: ${rec.average}μm / 目标: ${rec.target}μm (公差±${rec.tolerance}μm)`);
        lines.push(`        范围: ${rec.min}μm ~ ${rec.max}μm`);
        lines.push(`        合格率: ${rec.passRate}% (${rec.passCount}/${rec.points.length})`);
        lines.push(`        结果: ${rec.result === 'pass' ? '合格' : rec.result === 'fail' ? '不合格' : '待判定'}`);
      });
    }
    lines.push('');
    lines.push('  ▶ 附着力检测');
    if (drawerAdhesion.length === 0) {
      lines.push('    暂无记录');
    } else {
      drawerAdhesion.forEach((rec, i) => {
        lines.push(`    [${i + 1}] 时间: ${rec.time}`);
        lines.push(`        检测员: ${rec.inspector}`);
        lines.push(`        等级: ${rec.grade} 级`);
        lines.push(`        位置: ${rec.position}`);
        lines.push(`        结果: ${rec.result === 'pass' ? '合格' : rec.result === 'fail' ? '不合格' : '待判定'}`);
        if (rec.note) lines.push(`        备注: ${rec.note}`);
      });
    }
    lines.push('');
    lines.push('  ▶ 外观检测');
    if (drawerAppearance.length === 0) {
      lines.push('    暂无记录');
    } else {
      drawerAppearance.forEach((rec, i) => {
        lines.push(`    [${i + 1}] 时间: ${rec.time}`);
        lines.push(`        检测员: ${rec.inspector}`);
        lines.push(`        等级: ${rec.grade} 级`);
        lines.push(`        缺陷: ${rec.defects.length > 0 ? rec.defects.join('、') : '无'}`);
        lines.push(`        描述: ${rec.description}`);
        lines.push(`        结果: ${rec.result === 'pass' ? '合格' : rec.result === 'fail' ? '不合格' : '待判定'}`);
      });
    }
    lines.push('');
    lines.push('【下件汇总】');
    if (drawerUnloading) {
      lines.push(`  总数: ${drawerUnloading.totalQty} 件`);
      lines.push(`  合格: ${drawerUnloading.passQty} 件`);
      lines.push(`  不合格: ${drawerUnloading.failQty} 件`);
      lines.push(`  返工: ${drawerUnloading.reworkQty} 件`);
      lines.push(`  合格率: ${drawerUnloading.passRate}%`);
      lines.push(`  操作员: ${drawerUnloading.operator}`);
      lines.push(`  时间: ${drawerUnloading.time}`);
      if (drawerUnloading.failReason) lines.push(`  不合格原因: ${drawerUnloading.failReason}`);
      if (drawerUnloading.note) lines.push(`  备注: ${drawerUnloading.note}`);
    } else {
      lines.push('  暂无记录');
    }
    lines.push('');
    lines.push('【包装入库记录】');
    if (drawerPacking.length === 0) {
      lines.push('  暂无记录');
    } else {
      let totalPacked = 0;
      drawerPacking.forEach((rec, i) => {
        lines.push(`  [${i + 1}] 规格: ${rec.spec}  数量: ${rec.quantity} 件  库位: ${rec.location}`);
        lines.push(`        操作员: ${rec.operator}  时间: ${rec.time}`);
        totalPacked += rec.quantity;
      });
      lines.push(`  包装总计: ${totalPacked} 件`);
    }
    lines.push('');
    lines.push('【返工历史】');
    if (drawerRework.length === 0) {
      lines.push('  暂无返工记录');
    } else {
      drawerRework.forEach((rec, i) => {
        lines.push(`  [${i + 1}] 时间: ${rec.time}`);
        lines.push(`        原因: ${rec.reason}`);
        lines.push(`        返回到: ${rec.reworkStepName}`);
        lines.push(`        从工序: ${rec.fromStep}`);
        lines.push(`        操作员: ${rec.operator}`);
        if (rec.note) lines.push(`        备注: ${rec.note}`);
      });
    }
    lines.push('');
    lines.push('========================================');
    lines.push(`  打印时间: ${new Date().toLocaleString('zh-CN')}`);
    lines.push('========================================');
    return lines.join('\n');
  };

  const handleCopyToClipboard = async () => {
    const text = generateTraceReport();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 2500);
  };

  const reworkReasonOptions = [
    { value: '膜厚不达标', label: '膜厚不达标' },
    { value: '附着力不合格', label: '附着力不合格' },
    { value: '外观缺陷', label: '外观缺陷' },
    { value: '色差', label: '色差' },
    { value: '前处理不良', label: '前处理不良' },
    { value: '其他', label: '其他' },
  ];

  const reworkStepOptions = [
    { value: 'degreasing', label: '脱脂除油' },
    { value: 'phosphating', label: '磷化皮膜' },
    { value: 'drying', label: '水洗烘干' },
    { value: 'powder', label: '静电喷粉' },
    { value: 'paint', label: '喷漆膜厚' },
    { value: 'leveling', label: '流平' },
    { value: 'oven', label: '固化炉温' },
  ];

  const handleOpenReworkModal = () => {
    if (drawerBatch) {
      setReworkOperator(drawerBatch.operator);
    }
    setReworkReason('');
    setReworkStep('degreasing');
    setReworkNote('');
    setShowReworkModal(true);
  };

  const handleStartRework = () => {
    if (!drawerBatchId) return;
    if (!reworkReason) {
      showToast('error', '请选择返工原因');
      return;
    }
    if (!reworkOperator) {
      showToast('error', '请填写操作员');
      return;
    }
    startRework(drawerBatchId, reworkReason, reworkStep as ProcessStep, 'thickness', reworkOperator, reworkNote || undefined);
    setShowReworkModal(false);
    setDrawerBatchId(null);
    showToast('success', '批次已进入返工流程');
  };

  const handleCompleteRework = () => {
    if (!drawerBatchId) return;
    completeRework(drawerBatchId, drawerBatch?.operator || '');
    
    let targetStepName = '';
    const preTreatmentSteps: ProcessStep[] = ['degreasing', 'phosphating', 'drying'];
    const hasPreTreatment = preTreatmentSteps.every(s =>
      getProcessRecord(drawerBatchId, s)?.status === 'completed'
    );
    const hasSpray = getProcessRecord(drawerBatchId, 'powder')?.status === 'completed'
      || getProcessRecord(drawerBatchId, 'paint')?.status === 'completed';
    const hasCuring = getProcessRecord(drawerBatchId, 'leveling')?.status === 'completed'
      && getProcessRecord(drawerBatchId, 'oven')?.status === 'completed';
    const hasInspection = getProcessRecord(drawerBatchId, 'thickness')?.status === 'completed'
      && getProcessRecord(drawerBatchId, 'adhesion')?.status === 'completed'
      && getProcessRecord(drawerBatchId, 'appearance')?.status === 'completed';
    const hasUnloading = getProcessRecord(drawerBatchId, 'unloading')?.status === 'completed';
    const hasPacking = getProcessRecord(drawerBatchId, 'packing')?.status === 'completed';

    if (hasPacking) {
      targetStepName = '已完成';
    } else if (hasUnloading) {
      targetStepName = '包装工序';
    } else if (hasInspection) {
      targetStepName = '下件工序';
    } else if (hasCuring) {
      targetStepName = '检测工序';
    } else if (hasSpray) {
      targetStepName = '固化工序';
    } else if (hasPreTreatment) {
      targetStepName = '喷涂工序';
    } else {
      targetStepName = '前处理工序';
    }
    
    setDrawerBatchId(null);
    showToast('success', `返工完成，批次已回到${targetStepName}`);
  };

  const statusLabelMap: Record<string, string> = {
    loading: '上件中',
    pretreatment: '前处理',
    spraying: '喷涂中',
    curing: '固化中',
    inspection: '检测中',
    unloading: '下件中',
    packing: '包装中',
    rework: '返工中',
    finished: '已完成',
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={cn(
            'fixed top-5 right-5 z-[100] card px-5 py-3 flex items-center gap-2.5 animate-slide-up',
            toast.type === 'success' ? 'border-success/40 text-success' : 'border-danger/40 text-danger'
          )}
        >
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          <span className="text-sm">{toast.msg}</span>
        </div>
      )}
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
        {statsCards.map((s, i) => (
          <div
            key={s.label}
            onClick={() => setStatusFilter(s.filter)}
            className={cn(
              'card p-4 cursor-pointer transition-all hover:-translate-y-0.5',
              statusFilter === s.filter
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
                <option value="unloading">下件中</option>
                <option value="packing">包装中</option>
                <option value="rework">返工中</option>
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
                onViewHistory={() => setDrawerBatchId(batch.id)}
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

      {drawerBatchId && drawerBatch && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerBatchId(null)}
          />
          <div className="fixed right-0 top-0 h-full w-full md:w-3/5 z-50 bg-dark-800/95 backdrop-blur border-l border-dark-700 shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-5 border-b border-dark-700/50 flex items-center justify-between bg-dark-900/50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xl font-bold font-display text-primary-400">{drawerBatch.batchNo}</span>
                  <StatusBadge status={drawerBatch.status as any} size="md" />
                  {getReworkCount(drawerBatch.id) > 0 && (
                    <span className="bg-danger/20 text-danger text-xs font-semibold px-2.5 py-1 rounded-full border border-danger/30">
                      返工 {getReworkCount(drawerBatch.id)} 次
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-dark-300 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Package size={14} className="text-primary-400" />
                    {drawerBatch.workpieceName} · {drawerBatch.workpieceType}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <PackageCheck size={14} className="text-accent-400" />
                    {drawerBatch.quantity} 件
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User size={14} className="text-info" />
                    {drawerBatch.hangerName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User size={14} className="text-success" />
                    {drawerBatch.operator}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {drawerBatch.status === 'rework' ? (
                  <button
                    onClick={handleCompleteRework}
                    className="text-sm py-2 px-4 flex items-center gap-2 bg-success/20 text-success hover:bg-success/30 border border-success/30 rounded-lg transition-colors font-medium"
                  >
                    <CheckCircle2 size={16} />
                    返工完成
                  </button>
                ) : (
                  drawerBatch.status !== 'finished' && (
                    <button
                      onClick={handleOpenReworkModal}
                      className="text-sm py-2 px-4 flex items-center gap-2 bg-danger/20 text-danger hover:bg-danger/30 border border-danger/30 rounded-lg transition-colors font-medium"
                    >
                      <RotateCcw size={16} />
                      发起返工
                    </button>
                  )
                )}
                <button
                  onClick={() => setShowExportModal(true)}
                  className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                >
                  <FileText size={16} />
                  导出追溯单
                </button>
                <button
                  onClick={() => setDrawerBatchId(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-dark-700/50 hover:bg-dark-600 text-dark-300 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="text-lg font-semibold text-dark-100 mb-5 flex items-center gap-2">
                <ScrollText size={20} className="text-primary-400" />
                批次完整履历
              </h3>

              <div className="relative">
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-dark-700/50" />

                {drawerRecords.map((record, idx) => {
                  const isLast = idx === drawerRecords.length - 1;
                  return (
                    <div key={record.step} className="relative pl-10 pb-6">
                      <div className={cn(
                        'absolute left-0 top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 z-10',
                        record.status === 'completed' ? 'bg-success/20 border-success' :
                        record.status === 'running' ? 'bg-accent-500/20 border-accent-500' :
                        'bg-dark-800 border-dark-600'
                      )}>
                        {record.status === 'completed' ? (
                          <CheckCircle2 size={14} className="text-success" />
                        ) : record.status === 'running' ? (
                          <PlayCircle size={14} className="text-accent-400 animate-pulse" />
                        ) : (
                          <Circle size={14} className="text-dark-500" />
                        )}
                      </div>

                      <div className={cn(
                        'p-4 rounded-lg border transition-all',
                        record.status === 'completed' ? 'bg-success/5 border-success/20' :
                        record.status === 'running' ? 'bg-accent-500/5 border-accent-500/30' :
                        'bg-dark-800/30 border-dark-700/30'
                      )}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'font-semibold',
                              record.status === 'completed' ? 'text-dark-100' :
                              record.status === 'running' ? 'text-accent-400' :
                              'text-dark-500'
                            )}>
                              {record.stepName}
                            </span>
                            <span className="text-xs text-dark-500">第 {idx + 1} 道工序</span>
                          </div>
                          {record.result && (
                            <StatusBadge
                              status={record.result as any}
                              text={record.result === 'pass' ? '合格' : '不合格'}
                              size="sm"
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-dark-400 flex-wrap">
                          {record.operator && (
                            <span className="flex items-center gap-1">
                              <User size={12} />
                              负责人: {record.operator}
                            </span>
                          )}
                          {record.startTime && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {formatDateTime(record.startTime)} ~ {record.endTime ? formatDateTime(record.endTime) : '进行中'}
                            </span>
                          )}
                        </div>
                        {record.note && (
                          <p className="mt-2 text-xs text-dark-400 bg-dark-900/40 px-3 py-1.5 rounded">
                            备注: {record.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {drawerThickness.length > 0 && drawerThickness.map((rec, i) => (
                  <div key={`thick-${i}`} className="relative pl-10 pb-6">
                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 z-10 bg-primary-500/20 border-primary-500">
                      <Microscope size={14} className="text-primary-400" />
                    </div>
                    <div className="p-4 rounded-lg border bg-primary-500/5 border-primary-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-primary-300">漆膜厚度检测 #{i + 1}</span>
                        <StatusBadge status={rec.result as any} text={rec.result === 'pass' ? '合格' : rec.result === 'fail' ? '不合格' : '待判定'} size="sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-dark-300">
                        <div>检测员: {rec.inspector}</div>
                        <div>时间: {rec.time}</div>
                        <div>均值: <span className="text-success font-semibold">{rec.average}μm</span> / 目标 {rec.target}μm</div>
                        <div>范围: {rec.min} ~ {rec.max} μm</div>
                        <div>合格率: {rec.passRate}%</div>
                      </div>
                    </div>
                  </div>
                ))}

                {drawerAdhesion.length > 0 && drawerAdhesion.map((rec, i) => (
                  <div key={`adh-${i}`} className="relative pl-10 pb-6">
                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 z-10 bg-purple-500/20 border-purple-500">
                      <Microscope size={14} className="text-purple-400" />
                    </div>
                    <div className="p-4 rounded-lg border bg-purple-500/5 border-purple-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-purple-300">附着力检测 #{i + 1}</span>
                        <StatusBadge status={rec.result as any} text={rec.result === 'pass' ? '合格' : rec.result === 'fail' ? '不合格' : '待判定'} size="sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-dark-300">
                        <div>检测员: {rec.inspector}</div>
                        <div>时间: {rec.time}</div>
                        <div>等级: <span className={cn(
                          'font-semibold',
                          rec.grade <= 1 ? 'text-success' : rec.grade <= 2 ? 'text-warning' : 'text-danger'
                        )}>{rec.grade} 级</span></div>
                        <div>位置: {rec.position}</div>
                      </div>
                      {rec.note && <p className="mt-2 text-xs text-dark-400">备注: {rec.note}</p>}
                    </div>
                  </div>
                ))}

                {drawerAppearance.length > 0 && drawerAppearance.map((rec, i) => (
                  <div key={`app-${i}`} className="relative pl-10 pb-6">
                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 z-10 bg-accent-500/20 border-accent-500">
                      <Eye size={14} className="text-accent-400" />
                    </div>
                    <div className="p-4 rounded-lg border bg-accent-500/5 border-accent-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-accent-300">外观检测 #{i + 1}</span>
                        <StatusBadge status={rec.result as any} text={rec.result === 'pass' ? '合格' : rec.result === 'fail' ? '不合格' : '待判定'} size="sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-dark-300">
                        <div>检测员: {rec.inspector}</div>
                        <div>时间: {rec.time}</div>
                        <div>等级: <span className="text-accent-400 font-semibold">{rec.grade} 级</span></div>
                        <div>缺陷: {rec.defects.length > 0 ? rec.defects.join('、') : '无'}</div>
                      </div>
                      <p className="mt-2 text-xs text-dark-400">描述: {rec.description}</p>
                    </div>
                  </div>
                ))}

                {drawerUnloading && (
                  <div className="relative pl-10 pb-6">
                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 z-10 bg-cyan-500/20 border-cyan-500">
                      <PackageCheck size={14} className="text-cyan-400" />
                    </div>
                    <div className="p-4 rounded-lg border bg-cyan-500/5 border-cyan-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-cyan-300">下件记录</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-dark-300">
                        <div>总数: <span className="text-dark-100 font-semibold">{drawerUnloading.totalQty}</span></div>
                        <div>合格: <span className="text-success font-semibold">{drawerUnloading.passQty}</span></div>
                        <div>不合格: <span className="text-danger font-semibold">{drawerUnloading.failQty}</span></div>
                        <div>返工: <span className="text-warning font-semibold">{drawerUnloading.reworkQty}</span></div>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-dark-400">
                        <span>合格率: {drawerUnloading.passRate}%</span>
                        <span>操作员: {drawerUnloading.operator}</span>
                        <span>时间: {drawerUnloading.time}</span>
                      </div>
                    </div>
                  </div>
                )}

                {drawerPacking.length > 0 && (
                  <div className="relative pl-10 pb-6">
                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 z-10 bg-orange-500/20 border-orange-500">
                      <Package size={14} className="text-orange-400" />
                    </div>
                    <div className="p-4 rounded-lg border bg-orange-500/5 border-orange-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-orange-300">包装入库记录</span>
                        <span className="text-xs text-dark-400">共 {drawerPacking.length} 条</span>
                      </div>
                      <div className="space-y-2">
                        {drawerPacking.map((rec, i) => (
                          <div key={i} className="flex items-center justify-between text-xs text-dark-300 bg-dark-900/40 px-3 py-2 rounded">
                            <span>规格: {rec.spec} · 数量: {rec.quantity}件 · 库位: {rec.location}</span>
                            <span className="text-dark-500">{rec.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {drawerRework.length > 0 && (
                  <div className="relative pl-10 pb-6">
                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 z-10 bg-danger/20 border-danger">
                      <History size={14} className="text-danger" />
                    </div>
                    <div className="p-4 rounded-lg border bg-danger/5 border-danger/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-danger">返工记录</span>
                        <span className="text-xs text-dark-400">共 {drawerRework.length} 次返工</span>
                      </div>
                      <div className="space-y-2">
                        {drawerRework.map((rec, i) => (
                          <div key={i} className="text-xs text-dark-300 bg-dark-900/40 px-3 py-2 rounded">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-danger font-medium">第 {i + 1} 次返工</span>
                              <span className="text-dark-500">{rec.time}</span>
                            </div>
                            <div>原因: {rec.reason}</div>
                            <div>从 {rec.fromStep} 返回到 {rec.reworkStepName}</div>
                            <div>操作员: {rec.operator}</div>
                            {rec.note && <div className="text-dark-500">备注: {rec.note}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {showExportModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowExportModal(false)}
          >
            <div
              className="bg-dark-800 border border-dark-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-dark-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={20} className="text-primary-400" />
                  <h3 className="text-lg font-semibold text-dark-100">导出追溯单</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyToClipboard}
                    className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1.5"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? '已复制' : '复制到剪贴板'}
                  </button>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-dark-700/50 hover:bg-dark-600 text-dark-300 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <textarea
                  readOnly
                  value={generateTraceReport()}
                  className="w-full h-96 bg-dark-900 border border-dark-700 rounded-lg p-4 text-sm text-dark-200 font-mono leading-relaxed resize-none focus:outline-none focus:border-primary-500/50"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {showReworkModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-dark-900/70 backdrop-blur-sm">
          <div className="card w-full max-w-md mx-4 animate-slide-up">
            <div className="p-5 border-b border-dark-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw size={20} className="text-danger" />
                  <h3 className="text-lg font-semibold text-dark-100">发起返工</h3>
                </div>
                <button
                  onClick={() => setShowReworkModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-dark-700/50 hover:bg-dark-600 text-dark-300 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-1.5">
                  返工原因 <span className="text-danger">*</span>
                </label>
                <select
                  value={reworkReason}
                  onChange={(e) => setReworkReason(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">请选择返工原因</option>
                  {reworkReasonOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-1.5">
                  返回工序 <span className="text-danger">*</span>
                </label>
                <select
                  value={reworkStep}
                  onChange={(e) => setReworkStep(e.target.value)}
                  className="input-field w-full"
                >
                  {reworkStepOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-1.5">
                  操作员 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={reworkOperator}
                  onChange={(e) => setReworkOperator(e.target.value)}
                  placeholder="请输入操作员姓名"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-1.5">
                  备注
                </label>
                <textarea
                  value={reworkNote}
                  onChange={(e) => setReworkNote(e.target.value)}
                  placeholder="请输入备注信息（选填）"
                  rows={3}
                  className="input-field w-full resize-none"
                />
              </div>
            </div>
            <div className="p-5 border-t border-dark-700/50 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowReworkModal(false)}
                className="btn-outline text-sm py-2 px-5"
              >
                取消
              </button>
              <button
                onClick={handleStartRework}
                className="bg-danger hover:bg-danger/80 text-white text-sm py-2 px-5 rounded-lg font-medium transition-colors"
              >
                确认返工
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlowBoardPage;
