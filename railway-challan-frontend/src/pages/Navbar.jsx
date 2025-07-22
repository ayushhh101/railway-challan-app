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
    navigate('/login');
  };

  return (
     <nav className="bg-[#F8FAFC] border-b border-gray-200 shadow-sm px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-lg sm:text-xl font-bold text-[#1E40AF]">Railway Challan Portal</h1>

        <button
          className="sm:hidden focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <XMarkIcon className="h-6 w-6 text-[#1E40AF]" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-[#1E40AF]" />
          )}
        </button>

        {/* Desktop Links */}
        <div className="hidden sm:flex gap-4 items-center text-sm text-[#0F172A]">
          {user?.role === 'tte' && (
            <>
              <Link to="/issue-challan" className="hover:text-[#F97316] font-medium">Issue Challan</Link>
              <Link to="/view-challans" className="hover:text-[#F97316] font-medium">My Challans</Link>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <Link to="/admin-dashboard" className="hover:text-[#F97316] font-medium">Dashboard</Link>
              <Link to="/manage-users" className="hover:text-[#F97316] font-medium">Manage Users</Link>
              <Link to="/view-challans" className="hover:text-[#F97316] font-medium">All Challans</Link>
              <Link to="/passenger-history" className="hover:text-[#F97316] font-medium">History</Link>
            </>
          )}
          {user &&
          <button
            onClick={handleLogout}
            className="bg-[#DC2626] text-white px-4 py-1.5 rounded-md hover:bg-red-700 transition"
          >
            Logout
          </button>
          }
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden mt-3 flex flex-col gap-3 text-sm text-[#0F172A]">
          {user?.role === 'tte' && (
            <>
              <Link to="/issue-challan" className="hover:text-[#F97316]" onClick={() => setMenuOpen(false)}>Issue Challan</Link>
              <Link to="/view-challans" className="hover:text-[#F97316]" onClick={() => setMenuOpen(false)}>My Challans</Link>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <Link to="/admin-dashboard" className="hover:text-[#F97316]" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/manage-users" className="hover:text-[#F97316]" onClick={() => setMenuOpen(false)}>Manage Users</Link>
              <Link to="/view-challans" className="hover:text-[#F97316]" onClick={() => setMenuOpen(false)}>All Challans</Link>
              <Link to="/passenger-history" className="hover:text-[#F97316]" onClick={() => setMenuOpen(false)}>History</Link>
              
            </>
          )}

          {user ?
          <button
            onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }}
            className="bg-[#DC2626] text-white px-4 py-2 rounded-md hover:bg-red-700 transition w-full text-left"
          >
            Logout
          </button>:
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
