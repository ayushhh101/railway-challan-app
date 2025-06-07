import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
      <h1 className="text-lg font-bold">Railway Challan App</h1>

      {user && (
        <div className="flex gap-4 items-center text-sm">
          {/* Role-based Links */}
          {user.role === 'tte' && (
            <>
              <Link to="/issue-challan" className="hover:underline">
                Issue Challan
              </Link>
              <Link to="/view-challans" className="hover:underline">
                My Challans
              </Link>
            </>
          )}

          {user.role === 'admin' && (
            <>
              <Link to="/dashboard" className="hover:underline">
                Dashboard
              </Link>
              <Link to="/manage-users" className="hover:underline">
                Manage Users
              </Link>
              <Link to="/view-challans" className="hover:underline">
                All Challans
              </Link>
            </>
          )}

          {/* Logout */}
          <button onClick={handleLogout} className="bg-red-600 px-3 py-1 rounded-md ml-2">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
