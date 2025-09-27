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
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav 
      className="bg-white border-b border-gray-200 shadow-sm px-4 py-3"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Main Navigation Bar */}
        <div className="flex items-center justify-between">
          
          {/* Logo/Brand */}
          <div className="flex items-center">
            {/* Section Headings: Mobile 20-22px, Desktop 24-28px */}
            <h1 className="text-xl lg:text-2xl font-bold text-blue-800 leading-tight">
              Railway Challan Portal
            </h1>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {menuOpen ? (
              <XMarkIcon className="h-6 w-6 text-blue-800" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-blue-800" />
            )}
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6">
            
            {/* TTE Navigation */}
            {user?.role === 'tte' && (
              <>
                <Link 
                  to="/issue-challan" 
                  className="text-base font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 leading-normal"
                >
                  Issue Challan
                </Link>
                <Link 
                  to="/view-challans" 
                  className="text-base font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 leading-normal"
                >
                  My Challans
                </Link>
                <Link 
                  to="/tte-profile" 
                  className="text-base font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 leading-normal"
                >
                  Profile
                </Link>
              </>
            )}

            {/* Admin Navigation */}
            {user?.role === 'admin' && (
              <>
                <Link 
                  to="/admin-dashboard" 
                  className="text-base font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 leading-normal"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/manage-users" 
                  className="text-base font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 leading-normal"
                >
                  Manage Users
                </Link>
                <Link 
                  to="/view-challans" 
                  className="text-base font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 leading-normal"
                >
                  All Challans
                </Link>
                <Link 
                  to="/passenger-history" 
                  className="text-base font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 leading-normal"
                >
                  History
                </Link>
              </>
            )}

            {/* User Info & Logout */}
            {user && (
              <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
                {/* User Welcome */}
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 leading-normal">
                    {user.name}
                  </p>
                  <p className="text-xs text-center text-gray-500 leading-normal capitalize">
                    {user.role}
                  </p>
                </div>
                
                {/* Logout Button */}
                {/* Buttons/CTAs: 16px */}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 leading-normal"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="space-y-3">
              
              {/* TTE Mobile Navigation */}
              {user?.role === 'tte' && (
                <>
                  <Link 
                    to="/issue-challan" 
                    className="block text-base font-medium text-gray-700 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 leading-normal"
                    onClick={closeMenu}
                  >
                    Issue Challan
                  </Link>
                  <Link 
                    to="/view-challans" 
                    className="block text-base font-medium text-gray-700 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 leading-normal"
                    onClick={closeMenu}
                  >
                    My Challans
                  </Link>
                  <Link 
                    to="/tte-profile" 
                    className="block text-base font-medium text-gray-700 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 leading-normal"
                    onClick={closeMenu}
                  >
                    Profile
                  </Link>
                </>
              )}

              {/* Admin Mobile Navigation */}
              {user?.role === 'admin' && (
                <>
                  <Link 
                    to="/admin-dashboard" 
                    className="block text-base font-medium text-gray-700 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 leading-normal"
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/manage-users" 
                    className="block text-base font-medium text-gray-700 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 leading-normal"
                    onClick={closeMenu}
                  >
                    Manage Users
                  </Link>
                  <Link 
                    to="/view-challans" 
                    className="block text-base font-medium text-gray-700 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 leading-normal"
                    onClick={closeMenu}
                  >
                    All Challans
                  </Link>
                  <Link 
                    to="/passenger-history" 
                    className="block text-base font-medium text-gray-700 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 leading-normal"
                    onClick={closeMenu}
                  >
                    History
                  </Link>
                </>
              )}

              {/* User Info Mobile */}
              {user && (
                <div className="pt-3 mt-3 border-t border-gray-200">
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-base font-medium text-gray-900 leading-normal">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-500 leading-normal capitalize">
                      {user.role} Account
                    </p>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 leading-normal"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
