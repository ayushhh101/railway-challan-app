import React from 'react';
import { Link } from 'react-router-dom';

function ChooseLoginPage() {
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-8"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="w-full max-w-4xl">
        
        {/* Welcome Section */}
        <div className="text-center mb-12">
          {/* Page Title: Mobile 24-28px, Desktop 32-36px */}
          <h1 className="text-2xl lg:text-4xl font-bold text-blue-800 leading-tight mb-4">
            Welcome to Railway Challan Portal
          </h1>
          {/* Secondary Text: 14px */}
          <p className="text-sm text-gray-600 leading-normal max-w-2xl mx-auto">
            Streamlined digital platform for managing railway challans and violations. 
            Choose your login type to access the appropriate dashboard.
          </p>
        </div>

        {/* Login Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-3xl mx-auto">
          
          {/* TTE/Admin Login Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-shadow duration-300">
            <div className="text-center">
              {/* Icon */}
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              
              {/* Section Headings: Mobile 20-22px, Desktop 24-28px */}
              <h2 className="text-xl lg:text-2xl font-semibold text-blue-800 mb-4 leading-tight">
                Staff Portal
              </h2>
              
              {/* Body Text: 16px */}
              <p className="text-base text-gray-600 leading-normal mb-6">
                For Train Ticket Examiners and Administrative staff to issue and manage challans
              </p>

              {/* Features List */}
              <div className="text-left mb-8 space-y-2">
                {/* Secondary Text: 14px */}
                <div className="flex items-center text-sm text-gray-600 leading-normal">
                  <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Issue new challans
                </div>
                <div className="flex items-center text-sm text-gray-600 leading-normal">
                  <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  View analytics dashboard
                </div>
                <div className="flex items-center text-sm text-gray-600 leading-normal">
                  <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Manage user accounts
                </div>
                <div className="flex items-center text-sm text-gray-600 leading-normal">
                  <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Generate reports
                </div>
              </div>

              {/* Login Button */}
              {/* Buttons/CTAs: 16px */}
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 leading-normal"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                TTE / Admin Login
              </Link>
            </div>
          </div>

          {/* Passenger Login Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-shadow duration-300">
            <div className="text-center">
              {/* Icon */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              <h2 className="text-xl lg:text-2xl font-semibold text-green-800 mb-4 leading-tight">
                Passenger Portal
              </h2>
              
              <p className="text-base text-gray-600 leading-normal mb-6">
                For passengers to view, verify, and pay their railway challans online
              </p>

              {/* Features List */}
              <div className="mt-12 text-left mb-8 space-y-2">
                <div className="flex items-center text-sm text-gray-600 leading-normal">
                  <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  View challan history
                </div>
                <div className="flex items-center text-sm text-gray-600 leading-normal">
                  <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Pay fines online
                </div>
                <div className="flex items-center text-sm text-gray-600 leading-normal">
                  <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Download receipts
                </div>
                <div className="flex items-center text-sm text-gray-600 leading-normal">
                  <svg className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Track payment status
                </div>
              </div>

              <Link
                to="/passenger/login"
                className=" w-full inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-lg text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 leading-normal"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Passenger Login
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-3">
              <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-700 leading-normal">Need Help?</span>
            </div>
            <p className="text-sm text-gray-600 leading-normal">
              If you're having trouble accessing your account, please contact the railway administration 
              or visit the nearest railway station for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChooseLoginPage;
