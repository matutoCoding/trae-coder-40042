import { useState, useEffect } from 'react';
import { Wind, AlertTriangle, TrendingDown, Activity, Gauge } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ChartCard, CustomTooltip, GaugeChart } from '@/components/charts/ChartCard';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import StatusBadge from '@/components/ui/StatusBadge';
import { generateWasteGasData, mockAlarms } from '@/data/mockData';

function WasteGasMonitoringPage() {
  const [gasData, setGasData] = useState<any[]>([]);
  const [currentData, setCurrentData] = useState({
    voc: 42.5,
    dust: 10.2,
    temperature: 48,
    pressure: 101.5,
  });

  useEffect(() => {
    const data = generateWasteGasData();
    setGasData(data.slice(-24));
  }, []);

  const vocLimit = 50;
  const dustLimit = 15;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="VOC浓度"
          value={currentData.voc}
          unit="mg/m³"
          icon={Wind}
          color={currentData.voc > vocLimit * 0.8 ? 'warning' : 'success'}
          trend={-2.3}
          trendLabel="较昨日"
        />
        <StatCard
          title="粉尘浓度"
          value={currentData.dust}
          unit="mg/m³"
          icon={Activity}
          color={currentData.dust > dustLimit * 0.8 ? 'warning' : 'success'}
          trend={-1.5}
          trendLabel="较昨日"
        />
        <StatCard title="排放温度" value={currentData.temperature} unit="℃" icon={Gauge} color="primary" />
        <StatCard title="排放压力" value={currentData.pressure} unit="kPa" icon={TrendingDown} color="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="排放趋势"
            subtitle="近24小时废气排放监测"
            action={
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-dark-400">
                  <span className="w-3 h-1 bg-accent-500 rounded" />
                  VOC
                </div>
                <div className="flex items-center gap-1.5 text-xs text-dark-400">
                  <span className="w-3 h-1 bg-primary-500 rounded" />
                  粉尘
                </div>
              </div>
            }
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gasData}>
                  <defs>
                    <linearGradient id="vocGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dustGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#286FCC" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#286FCC" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#66758F" fontSize={11} />
                  <YAxis stroke="#66758F" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="voc" name="VOC(mg/m³)" stroke="#FF6B35" strokeWidth={2} fill="url(#vocGradient)" />
                  <Area type="monotone" dataKey="dust" name="粉尘(mg/m³)" stroke="#286FCC" strokeWidth={2} fill="url(#dustGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div className="space-y-6">
          <ChartCard title="实时监测" subtitle="当前排放状态">
            <div className="space-y-6 py-2">
              <GaugeChart
                value={currentData.voc}
                max={60}
                label="VOC 浓度"
                unit="mg/m³"
                warningThreshold={40}
                dangerThreshold={50}
              />
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold font-display text-primary-400">{currentData.dust}</p>
                  <p className="text-xs text-dark-400">粉尘 mg/m³</p>
                </div>
                <div>
                  <p className="text-lg font-bold font-display text-success">{currentData.temperature}</p>
                  <p className="text-xs text-dark-400">温度 ℃</p>
                </div>
                <div>
                  <p className="text-lg font-bold font-display text-accent-400">{currentData.pressure}</p>
                  <p className="text-xs text-dark-400">压力 kPa</p>
                </div>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="排放标准" subtitle="限值对照">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-300">VOC 限值</span>
                <span className="text-sm text-white font-medium">{vocLimit} mg/m³</span>
              </div>
              <div className="h-2 bg-dark-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-success via-warning to-danger rounded-full"
                  style={{ width: `${(currentData.voc / vocLimit) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-dark-500">
                <span>0</span>
                <span className="text-warning">80%</span>
                <span className="text-danger">100%</span>
              </div>
              <div className="pt-2 border-t border-dark-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-300">粉尘限值</span>
                  <span className="text-sm text-white font-medium">{dustLimit} mg/m³</span>
                </div>
                <div className="mt-2 h-2 bg-dark-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-success via-warning to-danger rounded-full"
                    style={{ width: `${(currentData.dust / dustLimit) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      <ChartCard title="排放告警" subtitle="近期告警记录">
        <div className="space-y-3">
          {mockAlarms.filter((a) => a.type !== 'info').slice(0, 3).map((alarm) => (
            <div
              key={alarm.id}
              className={`p-4 rounded-lg border-l-4 flex items-start gap-3 ${
                alarm.type === 'danger'
                  ? 'bg-danger/5 border-danger'
                  : 'bg-warning/5 border-warning'
              }`}
            >
              <AlertTriangle
                size={20}
                className={alarm.type === 'danger' ? 'text-danger' : 'text-warning'}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">{alarm.title}</p>
                  <StatusBadge
                    status={alarm.resolved ? 'stop' : 'running'}
                    text={alarm.resolved ? '已处理' : '待处理'}
                    size="sm"
                  />
                </div>
                <p className="text-xs text-dark-400 mt-1">{alarm.content}</p>
                <p className="text-xs text-dark-500 mt-2">{alarm.time}</p>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

export default WasteGasMonitoringPage;
