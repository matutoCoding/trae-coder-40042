import { create } from 'zustand';
import {
  LayoutDashboard,
  Package,
  FlaskConical,
  SprayCan,
  ThermometerSun,
  Microscope,
  PackageCheck,
  Wind,
  ChevronDown,
  ChevronRight,
  GitBranch,
  type LucideIcon,
} from 'lucide-react';

export interface MenuItem {
  key: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  children?: MenuItem[];
}

export const menuConfig: MenuItem[] = [
  {
    key: 'dashboard',
    label: '工作台',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    key: 'flowboard',
    label: '批次流转看板',
    icon: GitBranch,
    path: '/flowboard',
  },
  {
    key: 'loading',
    label: '上件挂具',
    icon: Package,
    path: '/loading',
  },
  {
    key: 'pretreatment',
    label: '前处理',
    icon: FlaskConical,
    children: [
      { key: 'degreasing', label: '脱脂除油', icon: FlaskConical, path: '/pretreatment/degreasing' },
      { key: 'phosphating', label: '磷化皮膜', icon: FlaskConical, path: '/pretreatment/phosphating' },
      { key: 'drying', label: '水洗烘干', icon: ThermometerSun, path: '/pretreatment/drying' },
    ],
  },
  {
    key: 'spraying',
    label: '喷粉喷漆',
    icon: SprayCan,
    children: [
      { key: 'powder', label: '静电喷粉', icon: SprayCan, path: '/spraying/powder' },
      { key: 'paint', label: '喷漆膜厚', icon: SprayCan, path: '/spraying/paint' },
    ],
  },
  {
    key: 'curing',
    label: '流平固化',
    icon: ThermometerSun,
    children: [
      { key: 'oven', label: '固化炉温曲线', icon: ThermometerSun, path: '/curing/oven' },
      { key: 'leveling', label: '流平时间', icon: ThermometerSun, path: '/curing/leveling' },
    ],
  },
  {
    key: 'inspection',
    label: '膜厚检测',
    icon: Microscope,
    children: [
      { key: 'thickness', label: '漆膜厚度检测', icon: Microscope, path: '/inspection/thickness' },
      { key: 'adhesion', label: '附着力划格', icon: Microscope, path: '/inspection/adhesion' },
      { key: 'appearance', label: '橘皮外观检查', icon: Microscope, path: '/inspection/appearance' },
    ],
  },
  {
    key: 'unloading',
    label: '下件包装',
    icon: PackageCheck,
    children: [
      { key: 'unload', label: '下件管理', icon: PackageCheck, path: '/unloading/unload' },
      { key: 'packing', label: '包装入库', icon: PackageCheck, path: '/unloading/packing' },
    ],
  },
  {
    key: 'waste-gas',
    label: '废气处理',
    icon: Wind,
    children: [
      { key: 'monitoring', label: '排放监测', icon: Wind, path: '/waste-gas/monitoring' },
      { key: 'equipment', label: '设备状态', icon: Wind, path: '/waste-gas/equipment' },
    ],
  },
];

interface SidebarState {
  collapsed: boolean;
  expandedKeys: string[];
  activeKey: string;
  toggleCollapsed: () => void;
  toggleExpand: (key: string) => void;
  setActiveKey: (key: string) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: false,
  expandedKeys: ['pretreatment', 'spraying', 'curing', 'inspection', 'unloading', 'waste-gas'],
  activeKey: 'dashboard',
  toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
  toggleExpand: (key: string) =>
    set((state) => ({
      expandedKeys: state.expandedKeys.includes(key)
        ? state.expandedKeys.filter((k) => k !== key)
        : [...state.expandedKeys, key],
    })),
  setActiveKey: (key: string) => set({ activeKey: key }),
}));

export { ChevronDown, ChevronRight };
