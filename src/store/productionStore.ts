import { create } from 'zustand';
import type {
  Batch,
  Hanger,
  BatchStatus,
  ProcessStep,
  ProcessRecord,
  DegreasingRecord,
  PhosphatingRecord,
  DryingRecord,
  ThicknessRecord,
  AdhesionRecord,
  AppearanceRecord,
  UnloadingRecord,
  PackingRecord,
} from '@/types';
import {
  mockBatches,
  mockHangers,
  mockDegreasingRecords,
  mockPhosphatingRecords,
  mockDryingRecords,
  mockThicknessRecords,
  mockAdhesionRecords,
  mockAppearanceRecords,
  mockUnloadingRecords,
  mockPackingRecords,
} from '@/data/mockData';

const processStepNames: Record<ProcessStep, string> = {
  loading: '上件挂具',
  degreasing: '脱脂除油',
  phosphating: '磷化皮膜',
  drying: '水洗烘干',
  powder: '静电喷粉',
  paint: '喷漆膜厚',
  leveling: '流平',
  oven: '固化炉温',
  thickness: '漆膜厚度检测',
  adhesion: '附着力划格',
  appearance: '橘皮外观检查',
  unloading: '下件',
  packing: '包装入库',
};

const initializeProcessRecords = (batchId: string): ProcessRecord[] => {
  const steps: ProcessStep[] = [
    'loading', 'degreasing', 'phosphating', 'drying',
    'powder', 'paint', 'leveling', 'oven',
    'thickness', 'adhesion', 'appearance', 'unloading', 'packing'
  ];
  return steps.map(step => ({
    batchId,
    step,
    stepName: processStepNames[step],
    status: 'pending',
  }));
};

const initializeMockProcessRecords = (): Record<string, ProcessRecord[]> => {
  const records: Record<string, ProcessRecord[]> = {};
  
  mockBatches.forEach(batch => {
    const processRecords = initializeProcessRecords(batch.id);
    const now = new Date();
    
    const updateStep = (step: ProcessStep, status: ProcessRecord['status'], hoursAgo: number, result?: ProcessRecord['result']) => {
      const idx = processRecords.findIndex(r => r.step === step);
      if (idx >= 0) {
        processRecords[idx].status = status;
        processRecords[idx].operator = batch.operator;
        if (status !== 'pending') {
          processRecords[idx].startTime = new Date(now.getTime() - hoursAgo * 3600000 - 1800000).toISOString();
        }
        if (status === 'completed') {
          processRecords[idx].endTime = new Date(now.getTime() - hoursAgo * 3600000).toISOString();
          processRecords[idx].result = result || 'pass';
        }
      }
    };

    if (batch.status === 'finished') {
      ['loading', 'degreasing', 'phosphating', 'drying', 'powder', 'paint', 'leveling', 'oven',
       'thickness', 'adhesion', 'appearance', 'unloading', 'packing'].forEach((s, i) => {
        updateStep(s as ProcessStep, 'completed', 16 - i);
      });
    } else if (batch.status === 'inspection') {
      ['loading', 'degreasing', 'phosphating', 'drying', 'powder', 'paint', 'leveling', 'oven'].forEach((s, i) => {
        updateStep(s as ProcessStep, 'completed', 5 - i);
      });
      updateStep('thickness', 'completed', 0.5);
      updateStep('adhesion', 'running', 0.2);
    } else if (batch.status === 'curing') {
      ['loading', 'degreasing', 'phosphating', 'drying', 'powder', 'paint'].forEach((s, i) => {
        updateStep(s as ProcessStep, 'completed', 3 - i * 0.4);
      });
      updateStep('leveling', 'completed', 1.2);
      updateStep('oven', 'running', 0.5);
    } else if (batch.status === 'spraying') {
      ['loading', 'degreasing', 'phosphating', 'drying'].forEach((s, i) => {
        updateStep(s as ProcessStep, 'completed', 2 - i * 0.3);
      });
      updateStep('powder', 'running', 0.5);
    } else if (batch.status === 'pretreatment') {
      updateStep('loading', 'completed', 1.5);
      updateStep('degreasing', 'completed', 0.8);
      updateStep('phosphating', 'running', 0.3);
    } else {
      updateStep('loading', 'running', 0.5);
    }

    records[batch.id] = processRecords;
  });

  return records;
};

interface ProductionStore {
  batches: Batch[];
  hangers: Hanger[];
  currentBatchId: string | null;
  processRecords: Record<string, ProcessRecord[]>;
  degreasingRecords: DegreasingRecord[];
  phosphatingRecords: PhosphatingRecord[];
  dryingRecords: DryingRecord[];
  thicknessRecords: ThicknessRecord[];
  adhesionRecords: AdhesionRecord[];
  appearanceRecords: AppearanceRecord[];
  unloadingRecords: UnloadingRecord[];
  packingRecords: PackingRecord[];

  unloadingData: Record<string, { passQty: number; failQty: number; reworkQty: number }>;

  setCurrentBatchId: (id: string | null) => void;
  addBatch: (data: Omit<Batch, 'id' | 'status' | 'startTime' | 'batchNo'>) => void;
  updateBatchStatus: (batchId: string, status: BatchStatus) => void;

  startProcess: (batchId: string, step: ProcessStep, operator?: string, params?: Record<string, any>) => void;
  completeProcess: (batchId: string, step: ProcessStep, result?: 'pass' | 'fail', note?: string) => void;
  getProcessRecords: (batchId: string) => ProcessRecord[];
  getProcessRecord: (batchId: string, step: ProcessStep) => ProcessRecord | undefined;

  addDegreasingRecord: (record: Omit<DegreasingRecord, 'id'>) => void;
  addPhosphatingRecord: (record: Omit<PhosphatingRecord, 'id'>) => void;
  addDryingRecord: (record: Omit<DryingRecord, 'id'>) => void;

  addThicknessRecord: (record: Omit<ThicknessRecord, 'id'>) => void;
  addAdhesionRecord: (record: Omit<AdhesionRecord, 'id'>) => void;
  addAppearanceRecord: (record: Omit<AppearanceRecord, 'id'>) => void;

  addUnloadingRecord: (record: Omit<UnloadingRecord, 'id'>) => void;
  updateUnloadingQty: (batchId: string, type: 'passQty' | 'failQty' | 'reworkQty', delta: number) => void;
  addPackingRecord: (record: Omit<PackingRecord, 'id'>) => void;

  getCurrentBatch: () => Batch | undefined;
  getBatchProcessStats: () => { total: number; loading: number; pretreatment: number; spraying: number; curing: number; inspection: number; unloading: number; packing: number; finished: number };
}

export const useProductionStore = create<ProductionStore>((set, get) => ({
  batches: [...mockBatches],
  hangers: [...mockHangers],
  currentBatchId: mockBatches[0]?.id || null,
  processRecords: initializeMockProcessRecords(),
  degreasingRecords: [...mockDegreasingRecords],
  phosphatingRecords: [...mockPhosphatingRecords],
  dryingRecords: [...mockDryingRecords],
  thicknessRecords: [...mockThicknessRecords],
  adhesionRecords: [...mockAdhesionRecords],
  appearanceRecords: [...mockAppearanceRecords],
  unloadingRecords: [...mockUnloadingRecords],
  packingRecords: [...mockPackingRecords],

  unloadingData: {},

  setCurrentBatchId: (id) => set({ currentBatchId: id }),

  addBatch: (data) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const batchCount = get().batches.filter(b => b.batchNo.includes(dateStr)).length + 1;
    const batchNo = `B${dateStr}${String(batchCount).padStart(3, '0')}`;
    const id = `batch-${Date.now()}`;

    const newBatch: Batch = {
      ...data,
      id,
      batchNo,
      status: 'loading',
      startTime: now.toISOString(),
    };

    const newProcessRecords = initializeProcessRecords(id);
    newProcessRecords[0] = {
      ...newProcessRecords[0],
      status: 'running',
      startTime: now.toISOString(),
      operator: data.operator,
    };

    set(state => ({
      batches: [...state.batches, newBatch],
      currentBatchId: id,
      processRecords: {
        ...state.processRecords,
        [id]: newProcessRecords,
      },
      hangers: state.hangers.map(h => 
        h.id === data.hangerId ? { ...h, status: 'in-use', useCount: h.useCount + 1 } as Hanger : h
      ),
    }));
  },

  updateBatchStatus: (batchId, status) => set(state => ({
    batches: state.batches.map(b => b.id === batchId ? { ...b, status } : b),
  })),

  startProcess: (batchId, step, operator, params) => {
    const now = new Date().toISOString();
    set(state => {
      const records = [...(state.processRecords[batchId] || [])];
      const idx = records.findIndex(r => r.step === step);
      if (idx >= 0) {
        records[idx] = {
          ...records[idx],
          status: 'running',
          startTime: now,
          operator: operator || records[idx].operator,
          params: { ...records[idx].params, ...params },
        };
      }
      return {
        processRecords: {
          ...state.processRecords,
          [batchId]: records,
        },
      };
    });
  },

  completeProcess: (batchId, step, result = 'pass', note) => {
    const now = new Date().toISOString();
    set(state => {
      const records = [...(state.processRecords[batchId] || [])];
      const idx = records.findIndex(r => r.step === step);
      if (idx >= 0) {
        records[idx] = {
          ...records[idx],
          status: 'completed',
          endTime: now,
          result,
          note,
        };
      }

      const batches = state.batches.map(b => {
        if (b.id !== batchId) return b;
        const allRecords = [...records];

        const stepStatus = (s: ProcessStep) => {
          const r = allRecords.find(x => x.step === s);
          return r ? r.status : 'pending';
        };

        let newStatus: BatchStatus = b.status;
        if (stepStatus('packing') === 'completed') {
          newStatus = 'finished';
        } else if (stepStatus('unloading') === 'completed') {
          newStatus = 'packing';
        } else if (stepStatus('thickness') === 'completed' &&
                   stepStatus('adhesion') === 'completed' &&
                   stepStatus('appearance') === 'completed') {
          newStatus = 'unloading';
        } else if (stepStatus('leveling') === 'completed' && stepStatus('oven') === 'completed') {
          newStatus = 'inspection';
        } else if (stepStatus('powder') === 'completed' || stepStatus('paint') === 'completed') {
          newStatus = 'curing';
        } else if (stepStatus('degreasing') === 'completed' &&
                   stepStatus('phosphating') === 'completed' &&
                   stepStatus('drying') === 'completed') {
          newStatus = 'spraying';
        } else if (stepStatus('loading') === 'completed') {
          newStatus = 'pretreatment';
        }

        return { ...b, status: newStatus };
      });

      return {
        processRecords: {
          ...state.processRecords,
          [batchId]: records,
        },
        batches,
      };
    });
  },

  getProcessRecords: (batchId) => get().processRecords[batchId] || [],
  getProcessRecord: (batchId, step) => {
    const records = get().processRecords[batchId] || [];
    return records.find(r => r.step === step);
  },

  addDegreasingRecord: (record) => set(state => ({
    degreasingRecords: [...state.degreasingRecords, { ...record, id: `deg-${Date.now()}` }],
  })),

  addPhosphatingRecord: (record) => set(state => ({
    phosphatingRecords: [...state.phosphatingRecords, { ...record, id: `phos-${Date.now()}` }],
  })),

  addDryingRecord: (record) => set(state => ({
    dryingRecords: [...state.dryingRecords, { ...record, id: `dry-${Date.now()}` }],
  })),

  addThicknessRecord: (record) => {
    const id = `thick-${Date.now()}`;
    set(state => ({
      thicknessRecords: [...state.thicknessRecords, { ...record, id }],
    }));
    const { getProcessRecord, completeProcess } = get();
    const rec = getProcessRecord(record.batchId, 'thickness');
    if (rec && rec.status !== 'completed') {
      completeProcess(record.batchId, 'thickness', (record.result === 'pending' ? 'pass' : record.result) as 'pass' | 'fail', `均值 ${record.average}μm`);
    }
  },

  addAdhesionRecord: (record) => {
    set(state => ({
      adhesionRecords: [...state.adhesionRecords, { ...record, id: `adh-${Date.now()}` }],
    }));
    const { getProcessRecord, completeProcess } = get();
    const rec = getProcessRecord(record.batchId, 'adhesion');
    if (rec && rec.status !== 'completed') {
      completeProcess(record.batchId, 'adhesion', (record.result === 'pending' ? 'pass' : record.result) as 'pass' | 'fail', `等级 ${record.grade}`);
    }
  },

  addAppearanceRecord: (record) => {
    set(state => ({
      appearanceRecords: [...state.appearanceRecords, { ...record, id: `app-${Date.now()}` }],
    }));
    const { getProcessRecord, completeProcess } = get();
    const rec = getProcessRecord(record.batchId, 'appearance');
    if (rec && rec.status !== 'completed') {
      completeProcess(record.batchId, 'appearance', (record.result === 'pending' ? 'pass' : record.result) as 'pass' | 'fail', `等级 ${record.grade}`);
    }
  },

  addUnloadingRecord: (record) => {
    set(state => ({
      unloadingRecords: [...state.unloadingRecords, { ...record, id: `unload-${Date.now()}` }],
    }));
    const { batches, getProcessRecord, completeProcess } = get();
    const batch = batches.find(b => b.id === record.batchId);
    const rec = getProcessRecord(record.batchId, 'unloading');
    if (batch && rec && rec.status !== 'completed') {
      if (record.totalQty >= batch.quantity) {
        completeProcess(record.batchId, 'unloading', record.passQty >= record.totalQty * 0.9 ? 'pass' : 'fail');
      }
    }
  },

  updateUnloadingQty: (batchId, type, delta) => set(state => {
    const batch = state.batches.find(b => b.id === batchId);
    const maxQty = batch ? batch.quantity : 9999;
    const current = state.unloadingData[batchId] || { passQty: 0, failQty: 0, reworkQty: 0 };
    const currentTotal = current.passQty + current.failQty + current.reworkQty;
    let newVal = current[type] + delta;
    const newTotal = currentTotal - current[type] + newVal;
    if (newTotal > maxQty) {
      newVal = current[type];
    }
    newVal = Math.max(0, newVal);
    const next = { ...current, [type]: newVal };
    return {
      unloadingData: {
        ...state.unloadingData,
        [batchId]: next,
      },
    };
  }),

  addPackingRecord: (record) => {
    set(state => ({
      packingRecords: [...state.packingRecords, { ...record, id: `pack-${Date.now()}` }],
    }));
    const { batches, getProcessRecord, completeProcess, packingRecords } = get();
    const batch = batches.find(b => b.id === record.batchId);
    const rec = getProcessRecord(record.batchId, 'packing');
    if (batch && rec && rec.status !== 'completed') {
      const packedQty = packingRecords
        .filter(r => r.batchId === record.batchId)
        .reduce((s, r) => s + r.quantity, 0);
      if (packedQty >= batch.quantity) {
        completeProcess(record.batchId, 'packing', 'pass');
      }
    }
  },

  getCurrentBatch: () => {
    const { batches, currentBatchId } = get();
    return batches.find(b => b.id === currentBatchId);
  },

  getBatchProcessStats: () => {
    const { batches } = get();
    return {
      total: batches.length,
      loading: batches.filter(b => b.status === 'loading').length,
      pretreatment: batches.filter(b => b.status === 'pretreatment').length,
      spraying: batches.filter(b => b.status === 'spraying').length,
      curing: batches.filter(b => b.status === 'curing').length,
      inspection: batches.filter(b => b.status === 'inspection').length,
      unloading: batches.filter(b => b.status === 'unloading').length,
      packing: batches.filter(b => b.status === 'packing').length,
      finished: batches.filter(b => b.status === 'finished').length,
    };
  },
}));
