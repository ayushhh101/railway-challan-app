import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Navbar from './pages/Navbar';
import PrivateRoute from './routes/PrivateRoute';
import IssueChallanPage from './pages/IssueChallanPage';
import ViewChallansPage from './pages/ViewChallansPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminAnomalies from './pages/AdminAnomalies';

function App() {
  return (
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

      </Routes>
    </Router>
  );
}

export default App;
