import { useState } from 'react';
import { Wrench, Clock, Shield, Filter, Cog, AlertTriangle, TrendingDown } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ChartCard } from '@/components/charts/ChartCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { mockWasteGasEquipments } from '@/data/mockData';

function WasteGasEquipmentPage() {
  const [selectedEquipment, setSelectedEquipment] = useState(mockWasteGasEquipments[0]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="运行设备" value={mockWasteGasEquipments.filter(e => e.status === 'running').length} unit="台" icon={Cog} color="success" />
        <StatCard title="总设备" value={mockWasteGasEquipments.length} unit="台" icon={Shield} color="primary" />
        <StatCard title="平均效率" value={92.1} unit="%" icon={TrendingDown} color="accent" />
        <StatCard title="待维护" value={1} unit="台" icon={Wrench} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title="设备列表" subtitle="废气处理设备状态">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockWasteGasEquipments.map((equipment) => (
                <div
                  key={equipment.id}
                  onClick={() => setSelectedEquipment(equipment)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedEquipment.id === equipment.id
                      ? 'bg-primary-500/10 border-primary-500/50'
                      : 'bg-dark-700/30 border-dark-600/30 hover:border-primary-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg ${
                        equipment.status === 'running'
                          ? 'bg-success/20 text-success'
                          : equipment.status === 'maintenance'
                          ? 'bg-warning/20 text-warning'
                          : 'bg-danger/20 text-danger'
                      }`}>
                        <Cog size={22} className={equipment.status === 'running' ? 'animate-spin' : ''} style={{ animationDuration: '3s' }} />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{equipment.name}</h4>
                        <p className="text-xs text-dark-400">{equipment.type}</p>
                      </div>
                    </div>
                    <StatusBadge status={equipment.status} size="sm" />
                  </div>

                  {equipment.efficiency > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-dark-400">处理效率</span>
                        <span className="text-success font-medium">{equipment.efficiency}%</span>
                      </div>
                      <div className="h-2 bg-dark-600/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-success to-primary-500 rounded-full transition-all"
                          style={{ width: `${equipment.efficiency}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-dark-400">
                    <span>上次维护: {equipment.lastMaintenance}</span>
                    <span className="text-accent-400">详情 →</span>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        <div className="space-y-6">
          <ChartCard title="设备详情" subtitle={selectedEquipment.name}>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
                <span className="text-sm text-dark-300">设备编号</span>
                <span className="text-sm text-white font-medium">{selectedEquipment.id}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
                <span className="text-sm text-dark-300">设备类型</span>
                <span className="text-sm text-white font-medium">{selectedEquipment.type}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
                <span className="text-sm text-dark-300">运行状态</span>
                <StatusBadge status={selectedEquipment.status} size="sm" />
              </div>
              {selectedEquipment.efficiency > 0 && (
                <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
                  <span className="text-sm text-dark-300">处理效率</span>
                  <span className="text-sm text-success font-medium">{selectedEquipment.efficiency}%</span>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
                <span className="text-sm text-dark-300">上次维护</span>
                <span className="text-sm text-white font-medium">{selectedEquipment.lastMaintenance}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
                <span className="text-sm text-dark-300">下次维护</span>
                <span className="text-sm text-accent-400 font-medium">{selectedEquipment.nextMaintenance}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-dark-700/50 flex gap-3">
              <button className="btn-primary flex-1 text-sm">维护记录</button>
              <button className="btn-outline flex-1 text-sm">报修</button>
            </div>
          </ChartCard>

          <ChartCard title="耗材状态" subtitle="过滤耗材寿命">
            <div className="space-y-4">
              {mockWasteGasEquipments.filter(e => e.filterLife < 100).map((equipment) => (
                <div key={equipment.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Filter size={16} className="text-primary-400" />
                      <span className="text-dark-300">{equipment.name}</span>
                    </div>
                    <span className={`font-medium ${
                      equipment.filterLife > 60 ? 'text-success' : equipment.filterLife > 30 ? 'text-warning' : 'text-danger'
                    }`}>
                      {equipment.filterLife}%
                    </span>
                  </div>
                  <div className="h-2 bg-dark-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        equipment.filterLife > 60 ? 'bg-success' : equipment.filterLife > 30 ? 'bg-warning' : 'bg-danger'
                      }`}
                      style={{ width: `${equipment.filterLife}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-dark-700/50">
              <div className="flex items-center gap-2 text-warning">
                <AlertTriangle size={16} />
                <span className="text-sm">活性炭滤芯寿命不足，建议更换</span>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      <ChartCard title="维护计划" subtitle="近期设备维护安排">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-dark-400 border-b border-dark-700/50">
                <th className="pb-3 font-medium">设备名称</th>
                <th className="pb-3 font-medium">类型</th>
                <th className="pb-3 font-medium">上次维护</th>
                <th className="pb-3 font-medium">计划维护</th>
                <th className="pb-3 font-medium">维护项目</th>
                <th className="pb-3 font-medium">状态</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { name: '活性炭吸附箱', type: '废气处理', last: '2026-06-01', next: '2026-06-25', item: '更换活性炭', status: 'warning' },
                { name: 'RTO焚烧炉', type: '废气处理', last: '2026-05-20', next: '2026-07-20', item: '全面检修', status: 'normal' },
                { name: '喷淋洗涤塔', type: '废气处理', last: '2026-05-15', next: '2026-07-15', item: '清洗喷嘴', status: 'normal' },
                { name: '引风机', type: '动力设备', last: '2026-04-10', next: '2026-07-10', item: '轴承润滑', status: 'normal' },
              ].map((item, index) => (
                <tr key={index} className="border-b border-dark-700/30 hover:bg-dark-700/20">
                  <td className="py-3 font-medium text-white">{item.name}</td>
                  <td className="py-3 text-dark-400">{item.type}</td>
                  <td className="py-3 text-dark-300">{item.last}</td>
                  <td className="py-3 text-dark-200">{item.next}</td>
                  <td className="py-3 text-dark-300">{item.item}</td>
                  <td className="py-3">
                    {item.status === 'warning' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-warning/20 text-warning">
                        <Clock size={12} />
                        即将到期
                      </span>
                    ) : (
                      <span className="text-xs text-dark-400">正常</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

export default WasteGasEquipmentPage;
