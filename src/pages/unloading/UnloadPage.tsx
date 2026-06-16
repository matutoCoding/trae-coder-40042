import { useState } from 'react';
import { Package, CheckCircle, XCircle, RefreshCw, PackageCheck, TrendingUp } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ChartCard } from '@/components/charts/ChartCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { mockUnloadingRecords } from '@/data/mockData';

function UnloadPage() {
  const [activeBatch, setActiveBatch] = useState({
    batchNo: 'B20260617004',
    workpieceName: '医疗器械外壳',
    totalQty: 20,
    passQty: 18,
    failQty: 1,
    reworkQty: 1,
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="今日下件" value={256} unit="件" icon={Package} color="primary" />
        <StatCard title="合格品" value={248} unit="件" icon={CheckCircle} color="success" />
        <StatCard title="不合格品" value={5} unit="件" icon={XCircle} color="danger" />
        <StatCard title="返工品" value={3} unit="件" icon={RefreshCw} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title="下件登记" subtitle={`当前批次: ${activeBatch.batchNo}`}>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-dark-700/30 rounded-lg">
                <div>
                  <p className="text-sm text-dark-400">工件名称</p>
                  <p className="text-lg font-medium text-white mt-1">{activeBatch.workpieceName}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-400">总数</p>
                  <p className="text-lg font-medium text-white mt-1">{activeBatch.totalQty} 件</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-success/10 rounded-lg border border-success/30 text-center">
                  <CheckCircle size={28} className="mx-auto text-success mb-2" />
                  <p className="text-2xl font-bold font-display text-success">{activeBatch.passQty}</p>
                  <p className="text-xs text-dark-400 mt-1">合格</p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <button className="w-8 h-8 rounded bg-success/20 text-success hover:bg-success/30 text-lg font-bold">+</button>
                    <button className="w-8 h-8 rounded bg-dark-700 text-dark-300 hover:bg-dark-600 text-lg font-bold">-</button>
                  </div>
                </div>
                <div className="p-4 bg-danger/10 rounded-lg border border-danger/30 text-center">
                  <XCircle size={28} className="mx-auto text-danger mb-2" />
                  <p className="text-2xl font-bold font-display text-danger">{activeBatch.failQty}</p>
                  <p className="text-xs text-dark-400 mt-1">不合格</p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <button className="w-8 h-8 rounded bg-danger/20 text-danger hover:bg-danger/30 text-lg font-bold">+</button>
                    <button className="w-8 h-8 rounded bg-dark-700 text-dark-300 hover:bg-dark-600 text-lg font-bold">-</button>
                  </div>
                </div>
                <div className="p-4 bg-warning/10 rounded-lg border border-warning/30 text-center">
                  <RefreshCw size={28} className="mx-auto text-warning mb-2" />
                  <p className="text-2xl font-bold font-display text-warning">{activeBatch.reworkQty}</p>
                  <p className="text-xs text-dark-400 mt-1">返工</p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <button className="w-8 h-8 rounded bg-warning/20 text-warning hover:bg-warning/30 text-lg font-bold">+</button>
                    <button className="w-8 h-8 rounded bg-dark-700 text-dark-300 hover:bg-dark-600 text-lg font-bold">-</button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-dark-700/50 space-y-4">
                <div>
                  <label className="text-sm text-dark-300">不合格原因</label>
                  <select className="input-field mt-1.5">
                    <option>请选择原因</option>
                    <option>膜厚不合格</option>
                    <option>附着力不合格</option>
                    <option>外观缺陷</option>
                    <option>其他</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-dark-300">备注</label>
                  <textarea rows={2} className="input-field mt-1.5 resize-none" placeholder="输入备注信息..." />
                </div>
                <div className="flex gap-3">
                  <button className="btn-accent flex-1 flex items-center justify-center gap-2">
                    <PackageCheck size={18} />
                    确认下件
                  </button>
                  <button className="btn-outline flex-1">取消</button>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>

        <div className="space-y-6">
          <ChartCard title="下件统计" subtitle="今日下件情况">
            <div className="space-y-4">
              <div className="text-center p-4 bg-primary-500/10 rounded-lg">
                <p className="text-4xl font-bold font-display text-primary-400">96.9%</p>
                <p className="text-sm text-dark-400 mt-1">合格率</p>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-dark-400">完成进度</span>
                    <span className="text-dark-200">4/5 批次</span>
                  </div>
                  <div className="h-2 bg-dark-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" style={{ width: '80%' }} />
                  </div>
                </div>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="待下件批次" subtitle="等待下件的批次">
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="p-3 bg-dark-700/30 rounded-lg border border-dark-600/30 hover:border-primary-500/30 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">B2026061700{i}</span>
                    <StatusBadge status="pending" text="待下件" size="sm" />
                  </div>
                  <p className="text-xs text-dark-400 mt-1">工件名称 - {i * 10}件</p>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>

      <ChartCard title="历史记录" subtitle="下件记录">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-dark-400 border-b border-dark-700/50">
                <th className="pb-3 font-medium">批次号</th>
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
              {mockUnloadingRecords.map((record) => (
                <tr key={record.id} className="border-b border-dark-700/30 hover:bg-dark-700/20">
                  <td className="py-3 font-medium text-primary-400">{record.batchNo}</td>
                  <td className="py-3 text-dark-200">{record.totalQty}</td>
                  <td className="py-3 text-success">{record.passQty}</td>
                  <td className="py-3 text-danger">{record.failQty}</td>
                  <td className="py-3 text-warning">{record.reworkQty}</td>
                  <td className="py-3 text-dark-200">{((record.passQty / record.totalQty) * 100).toFixed(1)}%</td>
                  <td className="py-3 text-dark-300">{record.operator}</td>
                  <td className="py-3 text-dark-400">{record.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

export default UnloadPage;
