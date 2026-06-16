import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Package, Layers, Clock, User } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ChartCard } from '@/components/charts/ChartCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { mockBatches, mockHangers } from '@/data/mockData';

function LoadingPage() {
  const [activeTab, setActiveTab] = useState<'batch' | 'hanger'>('batch');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="今日上件批次" value={8} unit="批" icon={Package} color="primary" />
        <StatCard title="今日上件数量" value={580} unit="件" icon={Package} color="accent" />
        <StatCard title="在用挂具" value={4} unit="个" icon={Layers} color="success" />
        <StatCard title="可用挂具" value={2} unit="个" icon={User} color="warning" />
      </div>

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
            <button className="btn-accent flex items-center gap-1.5 text-sm py-1.5">
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
                    <th className="pb-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {mockBatches.map((batch) => (
                    <tr
                      key={batch.id}
                      className="border-b border-dark-700/30 hover:bg-dark-700/20 transition-colors"
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
                      <td className="py-3 text-dark-400">{batch.startTime}</td>
                      <td className="py-3">
                        <button className="p-1 text-dark-400 hover:text-white transition-colors">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockHangers.map((hanger) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="上件趋势" subtitle="近7天上件数量统计">
          <div className="h-48 bg-dark-700/20 rounded-lg flex items-center justify-center text-dark-500">
            图表区域 - 上件趋势柱状图
          </div>
        </ChartCard>

        <ChartCard title="挂具使用率" subtitle="各挂具使用情况统计">
          <div className="h-48 bg-dark-700/20 rounded-lg flex items-center justify-center text-dark-500">
            图表区域 - 挂具使用率饼图
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

export default LoadingPage;
