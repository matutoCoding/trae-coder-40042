import type {
  Batch,
  Hanger,
  DegreasingRecord,
  PhosphatingRecord,
  DryingRecord,
  SprayingGun,
  OvenZone,
  TemperaturePoint,
  LevelingParams,
  ThicknessRecord,
  AdhesionRecord,
  AppearanceRecord,
  UnloadingRecord,
  PackingRecord,
  WasteGasData,
  WasteGasEquipment,
  Alarm,
  DashboardStats,
} from '@/types';

export const mockBatches: Batch[] = [
  {
    id: '1',
    batchNo: 'B20260617001',
    workpieceName: '汽车保险杠',
    workpieceType: '塑料件',
    quantity: 50,
    hangerId: 'H001',
    hangerName: '挂具-A01',
    status: 'spraying',
    startTime: '2026-06-17 08:30:00',
    operator: '张工',
  },
  {
    id: '2',
    batchNo: 'B20260617002',
    workpieceName: '电气控制柜',
    workpieceType: '金属件',
    quantity: 30,
    hangerId: 'H002',
    hangerName: '挂具-B02',
    status: 'pretreatment',
    startTime: '2026-06-17 09:15:00',
    operator: '李工',
  },
  {
    id: '3',
    batchNo: 'B20260617003',
    workpieceName: '家具金属架',
    workpieceType: '金属件',
    quantity: 100,
    hangerId: 'H003',
    hangerName: '挂具-C03',
    status: 'curing',
    startTime: '2026-06-17 07:45:00',
    operator: '王工',
  },
  {
    id: '4',
    batchNo: 'B20260617004',
    workpieceName: '医疗器械外壳',
    workpieceType: '塑料件',
    quantity: 20,
    hangerId: 'H004',
    hangerName: '挂具-D04',
    status: 'inspection',
    startTime: '2026-06-17 06:30:00',
    operator: '赵工',
  },
  {
    id: '5',
    batchNo: 'B20260616005',
    workpieceName: '门窗型材',
    workpieceType: '铝合金',
    quantity: 200,
    hangerId: 'H005',
    hangerName: '挂具-E05',
    status: 'finished',
    startTime: '2026-06-16 14:00:00',
    endTime: '2026-06-16 22:30:00',
    operator: '孙工',
  },
];

export const mockHangers: Hanger[] = [
  { id: 'H001', name: '挂具-A01', type: '专用挂具', capacity: 50, useCount: 128, status: 'in-use', lastMaintenance: '2026-06-10' },
  { id: 'H002', name: '挂具-B02', type: '通用挂具', capacity: 30, useCount: 256, status: 'in-use', lastMaintenance: '2026-06-08' },
  { id: 'H003', name: '挂具-C03', type: '大型挂具', capacity: 100, useCount: 89, status: 'in-use', lastMaintenance: '2026-06-12' },
  { id: 'H004', name: '挂具-D04', type: '精密挂具', capacity: 20, useCount: 312, status: 'available', lastMaintenance: '2026-06-15' },
  { id: 'H005', name: '挂具-E05', type: '型材挂具', capacity: 200, useCount: 175, status: 'available', lastMaintenance: '2026-06-05' },
  { id: 'H006', name: '挂具-F06', type: '维修中', capacity: 40, useCount: 445, status: 'maintenance', lastMaintenance: '2026-06-17' },
];

export const mockDegreasingRecords: DegreasingRecord[] = [
  { id: '1', batchId: '1', batchNo: 'B20260617001', temperature: 55, time: 12, concentration: 8.5, startTime: '2026-06-17 08:35:00', endTime: '2026-06-17 08:47:00', operator: '张工', result: 'pass' },
  { id: '2', batchId: '2', batchNo: 'B20260617002', temperature: 52, time: 10, concentration: 7.8, startTime: '2026-06-17 09:20:00', endTime: '2026-06-17 09:30:00', operator: '李工', result: 'pass' },
  { id: '3', batchId: '3', batchNo: 'B20260617003', temperature: 58, time: 15, concentration: 9.2, startTime: '2026-06-17 07:50:00', endTime: '2026-06-17 08:05:00', operator: '王工', result: 'pass' },
];

export const mockPhosphatingRecords: PhosphatingRecord[] = [
  { id: '1', batchId: '1', batchNo: 'B20260617001', temperature: 42, time: 8, ph: 3.2, filmWeight: 2.5, startTime: '2026-06-17 08:50:00', endTime: '2026-06-17 08:58:00', operator: '张工', result: 'pass' },
  { id: '2', batchId: '2', batchNo: 'B20260617002', temperature: 40, time: 6, ph: 3.0, filmWeight: 2.2, startTime: '2026-06-17 09:35:00', endTime: '2026-06-17 09:41:00', operator: '李工', result: 'pass' },
];

export const mockDryingRecords: DryingRecord[] = [
  { id: '1', batchId: '1', batchNo: 'B20260617001', washCount: 3, temperature: 120, time: 20, startTime: '2026-06-17 09:00:00', endTime: '2026-06-17 09:20:00', operator: '张工' },
  { id: '2', batchId: '3', batchNo: 'B20260617003', washCount: 4, temperature: 130, time: 25, startTime: '2026-06-17 08:10:00', endTime: '2026-06-17 08:35:00', operator: '王工' },
];

export const mockSprayGuns: SprayingGun[] = [
  { id: 'G01', name: '1号喷粉枪', type: 'powder', status: 'running', voltage: 75, current: 20, powderOutput: 120 },
  { id: 'G02', name: '2号喷粉枪', type: 'powder', status: 'running', voltage: 78, current: 22, powderOutput: 130 },
  { id: 'G03', name: '3号喷粉枪', type: 'powder', status: 'stop', voltage: 0, current: 0, powderOutput: 0 },
  { id: 'G04', name: '4号喷漆枪', type: 'paint', status: 'running', pressure: 0.45, flow: 180 },
  { id: 'G05', name: '5号喷漆枪', type: 'paint', status: 'maintenance', pressure: 0, flow: 0 },
];

export const mockOvenZones: OvenZone[] = [
  { id: 'Z1', name: '升温区', temperature: 165, targetTemp: 180, status: 'heating' },
  { id: 'Z2', name: '保温区1', temperature: 182, targetTemp: 180, status: 'stable' },
  { id: 'Z3', name: '保温区2', temperature: 179, targetTemp: 180, status: 'stable' },
  { id: 'Z4', name: '降温区', temperature: 120, targetTemp: 100, status: 'cooling' },
];

export const generateOvenTempData = (): TemperaturePoint[] => {
  const data: TemperaturePoint[] = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
    data.push({
      time: timeStr,
      value: 175 + Math.random() * 10 - 5,
    });
  }
  return data;
};

export const mockLevelingParams: LevelingParams = {
  temperature: 25,
  time: 10,
  status: 'running',
};

export const mockThicknessRecords: ThicknessRecord[] = [
  { id: '1', batchId: '4', batchNo: 'B20260617004', points: [85, 92, 88, 90, 87, 95, 89, 91], average: 89.6, min: 85, max: 95, target: 90, tolerance: 10, inspector: '质检-刘', time: '2026-06-17 10:30:00', result: 'pass' },
  { id: '2', batchId: '5', batchNo: 'B20260616005', points: [72, 78, 75, 80, 77, 73, 76, 79], average: 76.3, min: 72, max: 80, target: 80, tolerance: 10, inspector: '质检-陈', time: '2026-06-16 21:00:00', result: 'pass' },
];

export const mockAdhesionRecords: AdhesionRecord[] = [
  { id: '1', batchId: '4', batchNo: 'B20260617004', grade: 1, position: '正面中心', inspector: '质检-刘', time: '2026-06-17 10:45:00', result: 'pass' },
  { id: '2', batchId: '5', batchNo: 'B20260616005', grade: 0, position: '侧面边缘', inspector: '质检-陈', time: '2026-06-16 21:15:00', result: 'pass' },
];

export const mockAppearanceRecords: AppearanceRecord[] = [
  { id: '1', batchId: '4', batchNo: 'B20260617004', grade: 'B', defects: ['轻微橘皮'], description: '表面有轻微橘皮纹理，不影响使用', inspector: '质检-刘', time: '2026-06-17 11:00:00', result: 'pass' },
  { id: '2', batchId: '5', batchNo: 'B20260616005', grade: 'A', defects: [], description: '表面光滑，无明显缺陷', inspector: '质检-陈', time: '2026-06-16 21:30:00', result: 'pass' },
];

export const mockUnloadingRecords: UnloadingRecord[] = [
  { id: '1', batchId: '5', batchNo: 'B20260616005', totalQty: 200, passQty: 195, failQty: 3, reworkQty: 2, operator: '周工', time: '2026-06-16 22:30:00' },
  { id: '2', batchId: '4', batchNo: 'B20260617004', totalQty: 20, passQty: 0, failQty: 0, reworkQty: 0, operator: '-', time: '进行中' },
];

export const mockPackingRecords: PackingRecord[] = [
  { id: '1', batchId: '5', batchNo: 'B20260616005', spec: '标准木箱', quantity: 200, location: 'A区-03库位', operator: '吴工', time: '2026-06-16 23:00:00' },
];

export const generateWasteGasData = (): WasteGasData[] => {
  const data: WasteGasData[] = [];
  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000);
    const timeStr = `${time.getHours().toString().padStart(2, '0')}:00`;
    data.push({
      time: timeStr,
      voc: 35 + Math.random() * 20,
      dust: 8 + Math.random() * 5,
      temperature: 45 + Math.random() * 10,
      pressure: 101 + Math.random() * 2,
    });
  }
  return data;
};

export const mockWasteGasEquipments: WasteGasEquipment[] = [
  { id: 'E01', name: 'RTO焚烧炉', type: '废气处理', status: 'running', efficiency: 98.5, lastMaintenance: '2026-05-20', nextMaintenance: '2026-07-20', filterLife: 75 },
  { id: 'E02', name: '活性炭吸附箱', type: '废气处理', status: 'running', efficiency: 92.3, lastMaintenance: '2026-06-01', nextMaintenance: '2026-06-25', filterLife: 45 },
  { id: 'E03', name: '喷淋洗涤塔', type: '废气处理', status: 'running', efficiency: 85.6, lastMaintenance: '2026-05-15', nextMaintenance: '2026-07-15', filterLife: 60 },
  { id: 'E04', name: '引风机', type: '动力设备', status: 'running', efficiency: 0, lastMaintenance: '2026-04-10', nextMaintenance: '2026-07-10', filterLife: 100 },
];

export const mockAlarms: Alarm[] = [
  { id: '1', type: 'warning', title: '活性炭滤芯寿命告警', content: '活性炭吸附箱滤芯寿命低于50%，请及时更换', time: '2026-06-17 09:30:00', resolved: false },
  { id: '2', type: 'info', title: '挂具维护提醒', content: '挂具-F06已完成维护，可以投入使用', time: '2026-06-17 08:00:00', resolved: true },
  { id: '3', type: 'danger', title: '固化炉温异常', content: '保温区2温度低于设定值2℃，请检查加热系统', time: '2026-06-17 10:15:00', resolved: false },
  { id: '4', type: 'warning', title: 'VOC浓度接近阈值', content: '排放口VOC浓度接近排放标准限值，请注意监控', time: '2026-06-17 11:00:00', resolved: false },
];

export const mockDashboardStats: DashboardStats = {
  todayOutput: 356,
  passRate: 97.8,
  runningEquipment: 12,
  totalEquipment: 15,
  inProgressBatches: 4,
  pendingInspection: 2,
};

export const generateProductionTrendData = () => {
  const data = [];
  for (let i = 7; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    data.push({
      date: dateStr,
      output: Math.floor(300 + Math.random() * 100),
      pass: Math.floor(290 + Math.random() * 95),
    });
  }
  return data;
};

export const generateThicknessTrendData = () => {
  const data = [];
  for (let i = 10; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    data.push({
      date: dateStr,
      thickness: 80 + Math.random() * 20,
      target: 90,
    });
  }
  return data;
};
