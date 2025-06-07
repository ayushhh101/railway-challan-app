import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Navbar from './pages/Navbar';
import PrivateRoute from './routes/PrivateRoute';
import IssueChallanPage from './pages/IssueChallanPage';
// import Dashboard from './pages/Admin/Dashboard';
// import IssueChallan from './pages/TTE/IssueChallan';
// import ViewChallans from './pages/ViewChallans';
// import Unauthorized from './pages/Unauthorized';
// import PrivateRoute from './routes/PrivateRoute';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/issue-challan" element={
          <PrivateRoute allowedRoles={['tte']}>
            <IssueChallanPage />
          </PrivateRoute>
        } />
        {/* <Route path="/unauthorized" element={<Unauthorized />} /> */}

        {/* ADMIN ONLY */}
        {/* <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Dashboard />
            </PrivateRoute>
          }
        /> */}

        {/* TTE ONLY */}
        {/* <Route
          path="/issue-challan"
          element={
            <PrivateRoute allowedRoles={['tte']}>
              <IssueChallan />
            </PrivateRoute>
          }
        /> */}

        {/* BOTH ADMIN + TTE */}
        {/* <Route
          path="/view-challans"
          element={
            <PrivateRoute allowedRoles={['admin', 'tte']}>
              <ViewChallans />
            </PrivateRoute>
          }
        /> */}
      </Routes>
    </Router>
  );
}

export default App;
