import './index.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';  // Adjust path if needed
import { useEffect } from 'react';
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
import ManageUsersPage from './pages/ManageUsersPage';
import TTEProfilePage from './pages/TTEProfilePage';
import PassengerLoginPage from './pages/PassengerLoginPage';
import PassengerDashboard from './pages/PassengerDashboard';
import PassengerOnboardingPage from './pages/PassengerOnBoardingPage';
import ChallanDetailPage from './pages/ChallanDetailPage';
import ChooseLoginPage from './pages/ChooseLoginPage';

function HomeRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/choose-login" replace />;
  }

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin-dashboard" replace />;
    case 'tte':
      return <Navigate to="/issue-challan" replace />;
    case 'passenger':
      return <Navigate to="/passenger/dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
}

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

        <Route path="/" element={<HomeRedirect />} />

        <Route path="/choose-login" element={<ChooseLoginPage />} />

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

        <Route path="/manage-users" element={
          <PrivateRoute allowedRoles={['admin']}>
            <ManageUsersPage/>
          </PrivateRoute>
        } />

         <Route path="/tte-profile" element={
          <PrivateRoute allowedRoles={['tte']}>
            <TTEProfilePage />
          </PrivateRoute>
        } />

        <Route path="/passenger/login" element={
            <PassengerLoginPage/>
        } />

        <Route path="/passenger/dashboard" element={
          <PrivateRoute allowedRoles={['passenger']}>
            <PassengerDashboard />
          </PrivateRoute>
        } />

        <Route path="/challans/:id" element={
          <PrivateRoute allowedRoles={['tte','admin']}>
            <ChallanDetailPage />
          </PrivateRoute>
        } />

        <Route path="/passenger/onboard" element={<PassengerOnboardingPage/>}
        />

        <Route path="/verify/:id" element={<VerifyChallan/>}
        />

      </Routes>
    </Router>
    </>
  );
}

export default App;
