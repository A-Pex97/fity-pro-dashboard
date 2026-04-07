import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Trainees from './pages/Trainees';
import TraineeDetail from './pages/TraineeDetail';
import ActivityLogs from './pages/ActivityLogs';
import Payouts from './pages/Payouts';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trainees" element={<Trainees />} />
          <Route path="/trainees/:id" element={<TraineeDetail />} />
          <Route path="/activity" element={<ActivityLogs />} />
          <Route path="/payouts" element={<Payouts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
