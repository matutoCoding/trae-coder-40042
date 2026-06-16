import { useState } from 'react';
import { Zap, Activity, Gauge, Wind } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ChartCard } from '@/components/charts/ChartCard';
import StatusBadge from '@/components/ui/StatusBadge';
import BatchSelector from '@/components/ui/BatchSelector';
import { mockSprayGuns } from '@/data/mockData';

function PowderSprayPage() {
  const [selectedGun, setSelectedGun] = useState('G01');

  const powderGuns = mockSprayGuns.filter((g) => g.type === 'powder');

  return (
    <div className="space-y-6">
      <BatchSelector requiredStep="powder" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="喷粉电压" value={76.5} unit="KV" icon={Zap} color="accent" />
        <StatCard title="喷粉电流" value={21.3} unit="μA" icon={Activity} color="primary" />
        <StatCard title="出粉量" value={125} unit="g/min" icon={Gauge} color="success" />
        <StatCard title="运行喷枪" value={`${powderGuns.filter(g => g.status === 'running').length}/${powderGuns.length}`} unit="支" icon={Wind} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title="喷枪状态" subtitle="静电喷粉设备监控">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {powderGuns.map((gun) => (
                <div
                  key={gun.id}
                  onClick={() => setSelectedGun(gun.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedGun === gun.id
                      ? 'bg-primary-500/10 border-primary-500/50'
                      : 'bg-dark-700/30 border-dark-600/30 hover:border-primary-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">{gun.name}</h4>
                    <StatusBadge status={gun.status} size="sm" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-xl font-bold font-display text-accent-400">{gun.voltage || 0}</p>
                      <p className="text-xs text-dark-400">KV</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold font-display text-primary-400">{gun.current || 0}</p>
                      <p className="text-xs text-dark-400">μA</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold font-display text-success">{gun.powderOutput || 0}</p>
                      <p className="text-xs text-dark-400">g/min</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        <div className="space-y-6">
          <ChartCard title="参数调节" subtitle="喷粉工艺参数">
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-dark-300">静电电压</label>
                  <span className="text-sm text-accent-400 font-mono">75 KV</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="90"
                  defaultValue="75"
                  className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-accent-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-dark-300">出粉量</label>
                  <span className="text-sm text-primary-400 font-mono">120 g/min</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  defaultValue="120"
                  className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-dark-300">流化气压</label>
                  <span className="text-sm text-success font-mono">0.45 MPa</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.6"
                  step="0.01"
                  defaultValue="0.45"
                  className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-success"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button className="btn-primary flex-1">应用</button>
                <button className="btn-outline flex-1">复位</button>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="粉房状态" subtitle="喷粉房环境">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-300">房内温度</span>
                <span className="text-sm text-white font-medium">24.5 ℃</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-300">湿度</span>
                <span className="text-sm text-white font-medium">55 %</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-300">粉尘浓度</span>
                <span className="text-sm text-success font-medium">8 mg/m³</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-300">回收系统</span>
                <StatusBadge status="running" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-300">滤芯状态</span>
                <span className="text-sm text-warning font-medium">72%</span>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      <ChartCard title="粉末利用率统计" subtitle="近7天粉末使用情况">
        <div className="h-48 bg-dark-700/20 rounded-lg flex items-center justify-center text-dark-500">
          图表区域 - 粉末利用率趋势图
        </div>
      </ChartCard>
    </div>
  );
}

export default PowderSprayPage;
