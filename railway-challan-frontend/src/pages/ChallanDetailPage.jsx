import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  DocumentTextIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CurrencyRupeeIcon,
  CalendarDaysIcon,
  MapPinIcon,
  IdentificationIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
  PhotoIcon,
  ArrowLeftIcon,
  ClockIcon,
  BuildingOfficeIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { TrainIcon } from "lucide-react";

export default function ChallanDetailPage() {
  const { id } = useParams();
  const [challan, setChallan] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallan = async () => {
      const toastId = toast.loading('Loading challan details...');
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/challan/${id}`
        );
        setChallan(res.data.challan);
        toast.success('Challan details loaded successfully', { id: toastId });
      } catch (err) {
        const errorMessage = "Challan not found or server error.";
        setError(errorMessage);
        toast.error(errorMessage, { id: toastId });
      } finally {
        setLoading(false);
      }
    };
    fetchChallan();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-slate-700">Loading Challan Details...</p>
          <p className="text-sm text-slate-500 mt-1">Fetching complete information</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="text-center max-w-md mx-auto">
          <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200/50 rounded-2xl p-8">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExclamationTriangleIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-red-800 mb-3">Challan Not Found</h3>
            <p className="text-base text-red-700 mb-6">{error}</p>
            <Link
              to="/view-challans"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Challans</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!challan) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <DocumentTextIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-5xl font-black tracking-tight mb-2">
                  Challan Details
                </h1>
                <p className="text-lg text-blue-100 font-medium">
                  Complete information for challan #{challan._id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
            
            <div className="mt-6 lg:mt-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-center">
                  <p className="text-blue-100 text-sm font-medium">Payment Status</p>
                  <div className="flex items-center justify-center mt-2">
                    {challan.paid ? (
                      <span className="inline-flex items-center space-x-2 text-green-400">
                        <CheckCircleIcon className="w-8 h-8" />
                        <span className="text-2xl font-bold">PAID</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-2 text-red-400">
                        <XCircleIcon className="w-8 h-8" />
                        <span className="text-2xl font-bold">UNPAID</span>
                      </span>
                    )}
                  </div>
                  <p className="text-blue-200 text-xs mt-1">current status</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 space-y-8">
        
        {/* Back Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/view-challans"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Challans</span>
          </Link>
          
          <div className="text-sm text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <span className="font-medium">Challan ID:</span> 
            <span className="font-mono ml-2 text-slate-900">{challan._id}</span>
          </div>
        </div>

        {/* Main Challan Information Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Complete Challan Information</h2>
                <p className="text-slate-600">All details related to this violation record</p>
              </div>
              <div>
                <span className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-base font-bold border-2 ${
                  challan.paid
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}>
                  {challan.paid ? (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>PAYMENT COMPLETED</span>
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="w-5 h-5" />
                      <span>PAYMENT PENDING</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Information Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Passenger Information Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-800">Passenger Details</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-600">Full Name</span>
                    </div>
                    <p className="text-base font-bold text-slate-900">{challan.passengerName}</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <IdentificationIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-600">Aadhar Last 4 Digits</span>
                    </div>
                    <p className="text-base font-bold text-slate-900 font-mono">
                      {challan.passengerAadharLast4 ? `****${challan.passengerAadharLast4}` : '—'}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <PhoneIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-600">Mobile Number</span>
                    </div>
                    <p className="text-base font-bold text-slate-900">
                      {challan.mobileNumber || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Train Information Card */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <TrainIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-green-800">Train & Journey Details</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrainIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-600">Train Number</span>
                    </div>
                    <p className="text-base font-bold text-slate-900">{challan.trainNumber}</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v16a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                      </svg>
                      <span className="text-sm font-semibold text-slate-600">Coach Number</span>
                    </div>
                    <p className="text-base font-bold text-slate-900">
                      {challan.coachNumber || 'Not specified'}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPinIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-600">Location</span>
                    </div>
                    <p className="text-base font-bold text-slate-900">{challan.location}</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-600">Issue Date</span>
                    </div>
                    <p className="text-base font-bold text-slate-900">
                      {formatDate(challan.issuedAt || challan.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Offense Information Card */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border-2 border-orange-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                    <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-orange-800">Offense Details</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <ExclamationTriangleIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-600">Violation Reason</span>
                    </div>
                    <p className="text-base font-bold text-slate-900">{challan.reason}</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <InformationCircleIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-600">Additional Remarks</span>
                    </div>
                    <p className="text-base font-bold text-slate-900">
                      {challan.remarks || 'No additional remarks'}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-600">Issued By</span>
                    </div>
                    <p className="text-base font-bold text-slate-900">
                      {challan.issuedBy?.name || 'Unknown'} 
                      <span className="text-sm font-normal text-slate-600 ml-2">
                        ({challan.issuedBy?.employeeId})
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">
                      {challan.issuedBy?.role} • {challan.issuedBy?.zone || 'Zone not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Information Card */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                    <CurrencyRupeeIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-purple-800">Payment Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <CurrencyRupeeIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-600">Fine Amount</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-2xl font-bold text-green-600">₹{challan.fineAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircleIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-600">Payment Status</span>
                    </div>
                    <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-bold ${
                      challan.paid
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {challan.paid ? (
                        <>
                          <CheckCircleIcon className="w-4 h-4" />
                          <span>Payment Completed</span>
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="w-4 h-4" />
                          <span>Payment Pending</span>
                        </>
                      )}
                    </span>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="text-sm font-semibold text-slate-600">Payment Mode</span>
                    </div>
                    <p className="text-base font-bold text-slate-900 capitalize">
                      {challan.paymentMode}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <ClockIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-600">Issue Date & Time</span>
                    </div>
                    <p className="text-base font-bold text-slate-900">
                      {formatDateTime(challan.issuedAt || challan.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Signature & Proof Section */}
        {(challan.signature || (Array.isArray(challan.proofFiles) && challan.proofFiles.length > 0)) && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-green-50 px-8 py-6 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <PencilSquareIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">Verification Documents</h2>
                  <p className="text-slate-600">TTE signature and supporting evidence</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Signature Section */}
                {challan.signature && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <PencilSquareIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-blue-800">TTE Digital Signature</h3>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
                      <img
                        src={challan.signature}
                        alt="TTE Signature"
                        className="w-full max-w-xs h-auto rounded-lg border border-slate-300 shadow-sm"
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        Official signature of the issuing TTE officer
                      </p>
                    </div>
                  </div>
                )}

                {/* Proof Files Section */}
                {Array.isArray(challan.proofFiles) && challan.proofFiles.length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <PhotoIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-green-800">Supporting Evidence</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {challan.proofFiles.map((src, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 border-2 border-green-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <PhotoIcon className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">Proof Document {i + 1}</p>
                                <p className="text-xs text-slate-500">Supporting evidence file</p>
                              </div>
                            </div>
                            <a
                              href={src}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            >
                              View File
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Footer Navigation */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <p className="text-sm text-slate-600">
                  Need help with this challan? Contact railway customer support for assistance.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  to="/view-challans"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  <span>Back to All Challans</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}