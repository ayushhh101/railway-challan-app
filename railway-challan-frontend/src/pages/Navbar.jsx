import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-neutral-gray50 border-b border-gray-200 shadow-sm px-4 py-3"
    style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-lg sm:text-xl font-bold text-primary-blue">Railway Challan Portal</h1>

        <button
          className="sm:hidden focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {menuOpen ? (
            <XMarkIcon className="h-6 w-6 text-primary-blue" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-primary-blue" />
          )}
        </button>

        {/* Desktop Links */}
        <div className="hidden sm:flex gap-4 items-center text-sm text-neutral-gray900">
          {user?.role === 'tte' && (
            <>
              <Link to="/issue-challan" className="hover:text-accent-orange  font-medium">Issue Challan</Link>
              <Link to="/view-challans" className="hover:text-accent-orange font-medium">My Challans</Link>
              <Link to="/tte-profile" className="hover:text-accent-orange  font-medium">Profile</Link>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <Link to="/admin-dashboard" className="hover:text-accent-orange  font-medium">Dashboard</Link>
              <Link to="/manage-users" className="hover:text-accent-orange  font-medium">Manage Users</Link>
              <Link to="/view-challans" className="hover:text-accent-orange  font-medium">All Challans</Link>
              <Link to="/passenger-history" className="hover:text-accent-orange  font-medium">History</Link>
            </>
          )}
          {user &&
            <button
              onClick={handleLogout}
              className="bg-secondary-danger-red text-white px-4 py-1.5 rounded-md hover:bg-secondary-danger-light transition font-medium"
            >
              Logout
            </button>
          }
        </div>
      </div>

      {/* mobile */}
      {menuOpen && (
        <div className="sm:hidden mt-3 flex flex-col gap-3 text-sm text-[#0F172A]">
          {user?.role === 'tte' && (
            <>
              <Link to="/issue-challan" className="hover:text-accent-orange" onClick={() => setMenuOpen(false)}>Issue Challan</Link>
              <Link to="/view-challans" className="hover:text-accent-orange" onClick={() => setMenuOpen(false)}>My Challans</Link>
              <Link to="/tte-profile" className="hover:text-accent-orange" onClick={() => setMenuOpen(false)}>Profile</Link>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <Link to="/admin-dashboard" className="hover:text-accent-orange" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/manage-users" className="hover:text-accent-orange" onClick={() => setMenuOpen(false)}>Manage Users</Link>
              <Link to="/view-challans" className="hover:text-accent-orange" onClick={() => setMenuOpen(false)}>All Challans</Link>
              <Link to="/passenger-history" className="hover:text-accent-orange" onClick={() => setMenuOpen(false)}>History</Link>
            </>
          )}

          {user ?
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="bg-secondary-danger-red text-white px-4 py-2 rounded-md transition w-full text-left font-medium"
            >
              Logout
            </button> :
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className=" disabled: bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition w-full text-left"
            >
              Logout
            </button>
          }

        </div>
      )}
    </nav>
  );
}
