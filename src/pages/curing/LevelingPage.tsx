import { useState, useEffect } from 'react';
import { Clock, Thermometer, Wind, Play, Pause, RotateCcw } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ChartCard } from '@/components/charts/ChartCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { mockLevelingParams } from '@/data/mockData';

function LevelingPage() {
  const [isRunning, setIsRunning] = useState(true);
  const [remainingTime, setRemainingTime] = useState(600);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let timer: number;
    if (isRunning) {
      timer = window.setInterval(() => {
        setRemainingTime((prev) => Math.max(prev - 1, 0));
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (elapsedTime / (mockLevelingParams.time * 60)) * 100;

  const resetTimer = () => {
    setRemainingTime(mockLevelingParams.time * 60);
    setElapsedTime(0);
    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="流平温度" value={mockLevelingParams.temperature} unit="℃" icon={Thermometer} color="accent" />
        <StatCard title="设定时间" value={mockLevelingParams.time} unit="分钟" icon={Clock} color="primary" />
        <StatCard title="环境湿度" value={55} unit="%" icon={Wind} color="success" />
        <StatCard title="状态" value="流平中" unit="" icon={Play} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="流平倒计时"
            subtitle="当前流平工序进度"
            action={<StatusBadge status={isRunning ? 'running' : 'stop'} text={isRunning ? '流平中' : '已暂停'} />}
          >
            <div className="py-8 flex flex-col items-center">
              <div className="relative w-64 h-64">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="110"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="12"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="110"
                    fill="none"
                    stroke="#FF6B35"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${progress * 6.91} 691`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold font-display text-white tracking-wider glow-text">
                    {formatTime(remainingTime)}
                  </span>
                  <span className="text-sm text-dark-400 mt-2">剩余时间</span>
                  <span className="text-xs text-accent-400 mt-1">已完成 {progress.toFixed(1)}%</span>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`p-4 rounded-full transition-all ${
                    isRunning
                      ? 'bg-warning/20 text-warning hover:bg-warning/30'
                      : 'bg-success/20 text-success hover:bg-success/30'
                  }`}
                >
                  {isRunning ? <Pause size={28} /> : <Play size={28} />}
                </button>
                <button
                  onClick={resetTimer}
                  className="p-4 rounded-full bg-dark-700/50 text-dark-300 hover:bg-dark-700 hover:text-white transition-all"
                >
                  <RotateCcw size={28} />
                </button>
              </div>
            </div>
          </ChartCard>
        </div>

        <div className="space-y-6">
          <ChartCard title="参数设置" subtitle="流平工艺参数">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-dark-300">流平温度 (℃)</label>
                <input type="number" defaultValue={25} className="input-field mt-1.5" />
              </div>
              <div>
                <label className="text-sm text-dark-300">流平时间 (分钟)</label>
                <input type="number" defaultValue={10} className="input-field mt-1.5" />
              </div>
              <div>
                <label className="text-sm text-dark-300">环境湿度 (%)</label>
                <input type="number" defaultValue={55} className="input-field mt-1.5" />
              </div>
              <button className="btn-primary w-full">应用设置</button>
            </div>
          </ChartCard>

          <ChartCard title="流平质量要求" subtitle="质量标准">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-dark-400">流平效果</span>
                <span className="text-success font-medium">良好</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-dark-400">表面光洁度</span>
                <span className="text-white font-medium">Ra ≤ 0.8</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-dark-400">流平均匀性</span>
                <span className="text-success font-medium">合格</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-dark-400">针孔缺陷</span>
                <span className="text-success font-medium">无</span>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      <ChartCard title="流平时间分布" subtitle="近7天流平时间统计">
        <div className="h-48 bg-dark-700/20 rounded-lg flex items-center justify-center text-dark-500">
          图表区域 - 流平时间分布柱状图
        </div>
      </ChartCard>
    </div>
  );
}

export default LevelingPage;
