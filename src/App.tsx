import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Trainees from './pages/Trainees';
import TraineeDetail from './pages/TraineeDetail';
import Payouts from './pages/Payouts';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/trainees" replace />} />
          <Route path="/trainees" element={<Trainees />} />
          <Route path="/trainees/:id" element={<TraineeDetail />} />
          <Route path="/payouts" element={<Payouts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
