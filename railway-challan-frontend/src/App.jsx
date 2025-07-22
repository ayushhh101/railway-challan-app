import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Navbar from './pages/Navbar';
import PrivateRoute from './routes/PrivateRoute';
import IssueChallanPage from './pages/IssueChallanPage';
import ViewChallansPage from './pages/ViewChallansPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminAnomalies from './pages/AdminAnomalies';
import AdminAudit from './pages/AdminAudit';
import VerifyChallan from './pages/VerifyChallan';
import AdminMonthlyReport from './components/AdminMonthlyReport';
import PassengerHistoryPage from './pages/PassengerHistoryPage';
import {Toaster} from 'react-hot-toast'

function App() {
  return (
    <>
    <Toaster
        position="top-center"
        toastOptions={{
          success: { style: { background: "#d1fae5", color: "#065f46", fontWeight: 600 } },
          error: { style: { background: "#fee2e2", color: "#b91c1c", fontWeight: 600 } },
        }}
        reverseOrder={false}
      />
    <Router>
      <Navbar />
      <Routes>
        {/* <Route path="/" element={<LoginPage/>} /> */}
        <Route path="/login" element={<LoginPage />} />

        <Route path="/issue-challan" element={
          <PrivateRoute allowedRoles={['tte']}>
            <IssueChallanPage />
          </PrivateRoute>
        } />

        <Route path="/view-challans" element={
          <PrivateRoute allowedRoles={['admin','tte']}>
            <ViewChallansPage />
          </PrivateRoute>
        } />

        <Route path="/admin-dashboard" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminDashboardPage />
          </PrivateRoute>
        } />

        <Route path="/anomalies" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminAnomalies />
          </PrivateRoute>
        } />

        <Route path="/audit-log" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminAudit />
          </PrivateRoute>
        } />

        <Route path="/monthly-report" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminMonthlyReport />
          </PrivateRoute>
        } />

        <Route path="/passenger-history" element={
          <PrivateRoute allowedRoles={['tte','admin']}>
            <PassengerHistoryPage/>
          </PrivateRoute>
        } />
        <Route path="/passenger-history/:name/:aadhar" element={
          <PrivateRoute allowedRoles={['tte','admin']}>
            <PassengerHistoryPage/>
          </PrivateRoute>
        } />

        <Route path="/verify/:id" element={<VerifyChallan/>}
        />

      </Routes>
    </Router>
    </>
  );
}

export default App;
