export type BatchStatus = 'loading' | 'pretreatment' | 'spraying' | 'curing' | 'inspection' | 'finished' | 'rework';

export type EquipmentStatus = 'running' | 'stop' | 'fault' | 'maintenance';

export type InspectionResult = 'pass' | 'fail' | 'pending';

export type InspectionType = 'thickness' | 'adhesion' | 'appearance';

export interface Batch {
  id: string;
  batchNo: string;
  workpieceName: string;
  workpieceType: string;
  quantity: number;
  hangerId: string;
  hangerName: string;
  status: BatchStatus;
  startTime: string;
  endTime?: string;
  operator: string;
}

export interface Hanger {
  id: string;
  name: string;
  type: string;
  capacity: number;
  useCount: number;
  status: 'available' | 'in-use' | 'maintenance';
  lastMaintenance: string;
}

export interface ProcessParams {
  temperature?: number;
  time?: number;
  concentration?: number;
  ph?: number;
  voltage?: number;
  current?: number;
  pressure?: number;
  flow?: number;
}

export interface DegreasingRecord {
  id: string;
  batchId: string;
  batchNo: string;
  temperature: number;
  time: number;
  concentration: number;
  startTime: string;
  endTime: string;
  operator: string;
  result: 'pass' | 'fail';
}

export interface PhosphatingRecord {
  id: string;
  batchId: string;
  batchNo: string;
  temperature: number;
  time: number;
  ph: number;
  filmWeight: number;
  startTime: string;
  endTime: string;
  operator: string;
  result: 'pass' | 'fail';
}

export interface DryingRecord {
  id: string;
  batchId: string;
  batchNo: string;
  washCount: number;
  temperature: number;
  time: number;
  startTime: string;
  endTime: string;
  operator: string;
}

export interface SprayingGun {
  id: string;
  name: string;
  type: 'powder' | 'paint';
  status: EquipmentStatus;
  voltage?: number;
  current?: number;
  powderOutput?: number;
  pressure?: number;
  flow?: number;
}

export interface OvenZone {
  id: string;
  name: string;
  temperature: number;
  targetTemp: number;
  status: 'heating' | 'cooling' | 'stable';
}

export interface TemperaturePoint {
  time: string;
  value: number;
}

export interface LevelingParams {
  temperature: number;
  time: number;
  status: 'running' | 'idle';
}

export interface ThicknessRecord {
  id: string;
  batchId: string;
  batchNo: string;
  points: number[];
  average: number;
  min: number;
  max: number;
  target: number;
  tolerance: number;
  inspector: string;
  time: string;
  result: InspectionResult;
}

export interface AdhesionRecord {
  id: string;
  batchId: string;
  batchNo: string;
  grade: 0 | 1 | 2 | 3 | 4 | 5;
  position: string;
  inspector: string;
  time: string;
  result: InspectionResult;
}

export interface AppearanceRecord {
  id: string;
  batchId: string;
  batchNo: string;
  grade: 'A' | 'B' | 'C' | 'D';
  defects: string[];
  description: string;
  inspector: string;
  time: string;
  result: InspectionResult;
}

export interface UnloadingRecord {
  id: string;
  batchId: string;
  batchNo: string;
  totalQty: number;
  passQty: number;
  failQty: number;
  reworkQty: number;
  operator: string;
  time: string;
}

export interface PackingRecord {
  id: string;
  batchId: string;
  batchNo: string;
  spec: string;
  quantity: number;
  location: string;
  operator: string;
  time: string;
}

export interface WasteGasData {
  time: string;
  voc: number;
  dust: number;
  temperature: number;
  pressure: number;
}

export interface WasteGasEquipment {
  id: string;
  name: string;
  type: string;
  status: EquipmentStatus;
  efficiency: number;
  lastMaintenance: string;
  nextMaintenance: string;
  filterLife: number;
}

export interface Alarm {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  content: string;
  time: string;
  resolved: boolean;
}

export interface DashboardStats {
  todayOutput: number;
  passRate: number;
  runningEquipment: number;
  totalEquipment: number;
  inProgressBatches: number;
  pendingInspection: number;
}
