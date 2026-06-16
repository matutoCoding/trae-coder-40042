import { useState } from 'react';
import { Paintbrush, Droplets, Ruler, Layers } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ChartCard, CustomTooltip } from '@/components/charts/ChartCard';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import StatusBadge from '@/components/ui/StatusBadge';
import { mockSprayGuns } from '@/data/mockData';

function generatePaintData() {
  const data = [];
  for (let i = 10; i >= 0; i--) {
    data.push({
      time: `${i}h前`,
      thickness: 80 + Math.random() * 20,
      target: 90,
    });
  }
  return data.reverse();
}

function PaintSprayPage() {
  const [paintData] = useState(generatePaintData());
  const paintGuns = mockSprayGuns.filter((g) => g.type === 'paint');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="喷漆压力" value={0.45} unit="MPa" icon={Droplets} color="accent" />
        <StatCard title="油漆流量" value={180} unit="ml/min" icon={Paintbrush} color="primary" />
        <StatCard title="目标膜厚" value={90} unit="μm" icon={Ruler} color="success" />
        <StatCard title="运行喷枪" value={`${paintGuns.filter(g => g.status === 'running').length}/${paintGuns.length}`} unit="支" icon={Layers} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title="膜厚趋势" subtitle="漆膜厚度实时监控">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={paintData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#66758F" fontSize={11} />
                  <YAxis stroke="#66758F" fontSize={11} domain={[60, 120]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="target" name="目标膜厚" stroke="#10B981" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="thickness" name="实际膜厚" stroke="#FF6B35" strokeWidth={2} dot={{ fill: '#FF6B35', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div className="space-y-6">
          <ChartCard title="喷漆参数" subtitle="当前喷漆工艺">
            <div className="space-y-4">
              <div className="p-3 bg-dark-700/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-300">喷漆压力</span>
                  <span className="text-lg font-bold font-display text-accent-400">0.45 MPa</span>
                </div>
                <div className="mt-2 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-500 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
              <div className="p-3 bg-dark-700/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-300">油漆流量</span>
                  <span className="text-lg font-bold font-display text-primary-400">180 ml/min</span>
                </div>
                <div className="mt-2 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
              <div className="p-3 bg-dark-700/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-300">扇幅宽度</span>
                  <span className="text-lg font-bold font-display text-success">25 cm</span>
                </div>
              </div>
              <div className="p-3 bg-dark-700/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-300">喷枪距离</span>
                  <span className="text-lg font-bold font-display text-warning">20 cm</span>
                </div>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="喷枪列表" subtitle="喷漆枪运行状态">
            <div className="space-y-2">
              {paintGuns.map((gun) => (
                <div key={gun.id} className="flex items-center justify-between p-2.5 bg-dark-700/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Paintbrush size={16} className="text-primary-400" />
                    <span className="text-sm text-dark-200">{gun.name}</span>
                  </div>
                  <StatusBadge status={gun.status} size="sm" />
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="油漆配比" subtitle="当前使用油漆配方">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-dark-700/30 rounded-lg">
              <p className="text-2xl font-bold font-display text-primary-400">主漆</p>
              <p className="text-lg text-white mt-1">100 份</p>
            </div>
            <div className="text-center p-4 bg-dark-700/30 rounded-lg">
              <p className="text-2xl font-bold font-display text-accent-400">固化剂</p>
              <p className="text-lg text-white mt-1">50 份</p>
            </div>
            <div className="text-center p-4 bg-dark-700/30 rounded-lg">
              <p className="text-2xl font-bold font-display text-success">稀释剂</p>
              <p className="text-lg text-white mt-1">20 份</p>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="颜色管理" subtitle="当前批次颜色">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg" />
              <div>
                <p className="text-white font-medium">深蓝金属漆</p>
                <p className="text-sm text-dark-400">色号: BL-2026-M</p>
                <p className="text-sm text-dark-400">批次: P20260615003</p>
              </div>
            </div>
            <div className="pt-3 border-t border-dark-700/50 flex items-center justify-between">
              <span className="text-sm text-dark-400">剩余油漆量</span>
              <span className="text-white font-medium">12.5 L</span>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

export default PaintSprayPage;
