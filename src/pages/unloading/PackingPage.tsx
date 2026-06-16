import { useState } from 'react';
import { Package, Box, MapPin, PackagePlus, Search } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ChartCard } from '@/components/charts/ChartCard';
import { mockPackingRecords } from '@/data/mockData';

function PackingPage() {
  const [packingForm, setPackingForm] = useState({
    batchNo: 'B20260617004',
    spec: '标准木箱',
    quantity: 18,
    location: 'A区-05库位',
    operator: '吴工',
  });

  const specOptions = ['标准木箱', '纸箱', '托盘包装', '气泡膜', '定制包装'];
  const locationOptions = ['A区-01库位', 'A区-03库位', 'A区-05库位', 'B区-02库位', 'B区-04库位'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="今日入库" value={186} unit="件" icon={Package} color="primary" />
        <StatCard title="包装批次" value={5} unit="批" icon={Box} color="accent" />
        <StatCard title="库存量" value={1258} unit="件" icon={MapPin} color="success" />
        <StatCard title="待包装" value={2} unit="批" icon={PackagePlus} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title="包装入库" subtitle="产品包装与入库登记">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-dark-300">批次号</label>
                  <div className="relative mt-1.5">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                    <input
                      type="text"
                      value={packingForm.batchNo}
                      onChange={(e) => setPackingForm({ ...packingForm, batchNo: e.target.value })}
                      className="input-field pl-9"
                      placeholder="搜索或输入批次号"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-dark-300">包装规格</label>
                  <select
                    value={packingForm.spec}
                    onChange={(e) => setPackingForm({ ...packingForm, spec: e.target.value })}
                    className="input-field mt-1.5"
                  >
                    {specOptions.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-dark-300">入库数量</label>
                  <input
                    type="number"
                    value={packingForm.quantity}
                    onChange={(e) => setPackingForm({ ...packingForm, quantity: Number(e.target.value) })}
                    className="input-field mt-1.5"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-dark-300">存放库位</label>
                  <select
                    value={packingForm.location}
                    onChange={(e) => setPackingForm({ ...packingForm, location: e.target.value })}
                    className="input-field mt-1.5"
                  >
                    {locationOptions.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-dark-300">操作员</label>
                  <input
                    type="text"
                    value={packingForm.operator}
                    onChange={(e) => setPackingForm({ ...packingForm, operator: e.target.value })}
                    className="input-field mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-sm text-dark-300">备注</label>
                  <textarea
                    rows={2}
                    className="input-field mt-1.5 resize-none"
                    placeholder="输入备注信息..."
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-dark-700/50 flex gap-3">
              <button className="btn-accent flex-1 flex items-center justify-center gap-2">
                <PackagePlus size={18} />
                确认入库
              </button>
              <button className="btn-outline flex-1">重置</button>
            </div>
          </ChartCard>
        </div>

        <div className="space-y-6">
          <ChartCard title="库存概览" subtitle="当前库存情况">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                    <Box size={20} className="text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">A 库区</p>
                    <p className="text-xs text-dark-400">金属件存放区</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-white">580件</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-500/20 flex items-center justify-center">
                    <Box size={20} className="text-accent-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">B 库区</p>
                    <p className="text-xs text-dark-400">塑料件存放区</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-white">428件</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                    <Box size={20} className="text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">C 库区</p>
                    <p className="text-xs text-dark-400">成品待发区</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-white">250件</span>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="待包装批次" subtitle="等待包装的产品">
            <div className="space-y-3">
              {[
                { batch: 'B20260617004', name: '医疗器械外壳', qty: 18 },
                { batch: 'B20260617003', name: '家具金属架', qty: 100 },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-dark-700/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary-400">{item.batch}</span>
                    <span className="text-xs text-dark-400">{item.qty}件</span>
                  </div>
                  <p className="text-xs text-dark-400 mt-1">{item.name}</p>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>

      <ChartCard title="入库记录" subtitle="包装入库历史记录">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-dark-400 border-b border-dark-700/50">
                <th className="pb-3 font-medium">批次号</th>
                <th className="pb-3 font-medium">包装规格</th>
                <th className="pb-3 font-medium">数量</th>
                <th className="pb-3 font-medium">存放库位</th>
                <th className="pb-3 font-medium">操作员</th>
                <th className="pb-3 font-medium">入库时间</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {mockPackingRecords.map((record) => (
                <tr key={record.id} className="border-b border-dark-700/30 hover:bg-dark-700/20">
                  <td className="py-3 font-medium text-primary-400">{record.batchNo}</td>
                  <td className="py-3 text-dark-200">{record.spec}</td>
                  <td className="py-3 text-dark-200">{record.quantity}件</td>
                  <td className="py-3 text-dark-300">{record.location}</td>
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

export default PackingPage;
