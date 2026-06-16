import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/dashboard/Dashboard';
import LoadingPage from '@/pages/loading/LoadingPage';
import DegreasingPage from '@/pages/pretreatment/DegreasingPage';
import PhosphatingPage from '@/pages/pretreatment/PhosphatingPage';
import DryingPage from '@/pages/pretreatment/DryingPage';
import PowderSprayPage from '@/pages/spraying/PowderSprayPage';
import PaintSprayPage from '@/pages/spraying/PaintSprayPage';
import OvenPage from '@/pages/curing/OvenPage';
import LevelingPage from '@/pages/curing/LevelingPage';
import ThicknessPage from '@/pages/inspection/ThicknessPage';
import AdhesionPage from '@/pages/inspection/AdhesionPage';
import AppearancePage from '@/pages/inspection/AppearancePage';
import UnloadPage from '@/pages/unloading/UnloadPage';
import PackingPage from '@/pages/unloading/PackingPage';
import WasteGasMonitoringPage from '@/pages/waste-gas/WasteGasMonitoringPage';
import WasteGasEquipmentPage from '@/pages/waste-gas/WasteGasEquipmentPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="loading" element={<LoadingPage />} />
          
          <Route path="pretreatment">
            <Route index element={<Navigate to="degreasing" replace />} />
            <Route path="degreasing" element={<DegreasingPage />} />
            <Route path="phosphating" element={<PhosphatingPage />} />
            <Route path="drying" element={<DryingPage />} />
          </Route>
          
          <Route path="spraying">
            <Route index element={<Navigate to="powder" replace />} />
            <Route path="powder" element={<PowderSprayPage />} />
            <Route path="paint" element={<PaintSprayPage />} />
          </Route>
          
          <Route path="curing">
            <Route index element={<Navigate to="oven" replace />} />
            <Route path="oven" element={<OvenPage />} />
            <Route path="leveling" element={<LevelingPage />} />
          </Route>
          
          <Route path="inspection">
            <Route index element={<Navigate to="thickness" replace />} />
            <Route path="thickness" element={<ThicknessPage />} />
            <Route path="adhesion" element={<AdhesionPage />} />
            <Route path="appearance" element={<AppearancePage />} />
          </Route>
          
          <Route path="unloading">
            <Route index element={<Navigate to="unload" replace />} />
            <Route path="unload" element={<UnloadPage />} />
            <Route path="packing" element={<PackingPage />} />
          </Route>
          
          <Route path="waste-gas">
            <Route index element={<Navigate to="monitoring" replace />} />
            <Route path="monitoring" element={<WasteGasMonitoringPage />} />
            <Route path="equipment" element={<WasteGasEquipmentPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
