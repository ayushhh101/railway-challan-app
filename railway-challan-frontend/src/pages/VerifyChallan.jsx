import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function VerifyChallan() {
  const { id } = useParams();
  const [challan, setChallan] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);

  useEffect(() => {
    fetchChallan();
  }, [id, paidSuccess]);

  const fetchChallan = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/challan/${id}`);
      setChallan(res.data.challan);
      setError('');
    } catch (err) {
      console.error('Error fetching challan:', err);
      setError(err.response?.data?.message || 'Challan not found or invalid link');
      setChallan(null);
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise(resolve => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => { resolve(true); };
      script.onerror = () => { resolve(false); };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setPaying(true);
    const toastId = toast.loading('Initializing payment...');
    
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Failed to load payment gateway");
      }

      toast.loading('Opening payment gateway...', { id: toastId });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_TEST_KEY, 
        amount: challan.fineAmount * 100, 
        currency: "INR",
        name: "Railway Challan Payment",
        description: `Challan ID: ${challan._id.slice(-8)}`,
        handler: async function (response) {
          toast.loading('Confirming payment...', { id: toastId });
          try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/challan/pay/${id}`);
            setPaidSuccess(true);
            toast.success("Payment successful! Challan marked as paid.", { id: toastId });
          } catch (err) {
            console.error('Payment confirmation error:', err);
            toast.error("Payment succeeded but backend failed! Contact support.", { id: toastId });
          }
        },
        prefill: {
          name: challan.passengerName,
        },
        notes: {
          challan_id: challan._id,
        },
        theme: { color: "#1E40AF" },
        modal: {
          ondismiss: () => {
            setPaying(false);
            toast.dismiss(toastId);
          },
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(error.message, { id: toastId });
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          {/* Body Text: 16px */}
          <p className="text-base text-gray-600 leading-normal">Loading challan details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="w-full max-w-md">
          <div className="bg-white border-2 border-red-200 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {/* Section Headings: Mobile 20-22px */}
            <h2 className="text-xl font-bold text-red-800 mb-4 leading-tight">
              Challan Not Found
            </h2>
            {/* Body Text: 16px */}
            <p className="text-base text-red-700 leading-normal mb-6">{error}</p>
            <button
              onClick={fetchChallan}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 leading-normal"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="w-full max-w-2xl">
        
        {/* Challan Verification Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            {/* Page Title: Mobile 24-28px, Desktop 32-36px */}
            <h1 className="text-2xl lg:text-3xl font-bold text-blue-800 leading-tight mb-2">
              Challan Verification
            </h1>
            {/* Secondary Text: 14px */}
            <p className="text-sm text-gray-600 leading-normal">
              Review challan details and make payment if required
            </p>
          </div>

          {/* Challan Details */}
          <div className="space-y-6">
            
            {/* Status Badge */}
            <div className="flex justify-center mb-6">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-base font-semibold leading-normal ${
                challan.paid
                  ? 'bg-green-100 text-green-800 border-2 border-green-200'
                  : 'bg-red-100 text-red-800 border-2 border-red-200'
              }`}>
                {challan.paid ? (
                  <>
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Paid
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Unpaid
                  </>
                )}
              </span>
            </div>

            {/* Challan Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Passenger Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                {/* Form Labels: 14px */}
                <label className="block text-sm font-medium text-gray-600 mb-2 leading-normal">
                  Passenger Name
                </label>
                {/* Body Text: 16px */}
                <p className="text-base font-semibold text-gray-900 leading-normal">
                  {challan.passengerName}
                </p>
              </div>

              {/* Challan ID */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-600 mb-2 leading-normal">
                  Challan ID
                </label>
                <p className="text-base font-semibold text-gray-900 leading-normal font-mono">
                  {challan._id.slice(-12)}
                </p>
              </div>

              {/* Train Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-600 mb-2 leading-normal">
                  Train Number
                </label>
                <p className="text-base font-semibold text-gray-900 leading-normal">
                  {challan.trainNumber}
                </p>
              </div>

              {/* Coach Number */}
              {challan.coachNumber && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2 leading-normal">
                    Coach Number
                  </label>
                  <p className="text-base font-semibold text-gray-900 leading-normal">
                    {challan.coachNumber}
                  </p>
                </div>
              )}

              {/* Violation Reason */}
              <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-2 leading-normal">
                  Violation Reason
                </label>
                <p className="text-base font-semibold text-gray-900 leading-normal">
                  {challan.reason}
                </p>
              </div>
            </div>

            {/* Fine Amount Highlight */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-lg p-6 text-center">
              <label className="block text-sm font-medium text-orange-700 mb-2 leading-normal">
                Fine Amount
              </label>
              {/* Section Headings: Mobile 20-22px, Desktop 24-28px */}
              <p className="text-2xl lg:text-3xl font-bold text-orange-800 leading-tight">
                ₹{challan.fineAmount?.toLocaleString()}
              </p>
            </div>

            {/* Issue Date */}
            <div className="text-center">
              <label className="block text-sm font-medium text-gray-600 mb-2 leading-normal">
                Issued On
              </label>
              <p className="text-base text-gray-900 leading-normal">
                {new Date(challan.issuedAt || challan.createdAt).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {/* TTE Signature */}
            {challan.signature && (
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-600 mb-3 leading-normal">
                  TTE Signature
                </label>
                <div className="flex justify-center">
                  <img 
                    src={challan.signature} 
                    alt="TTE Signature" 
                    className="border-2 border-gray-300 rounded-lg max-w-xs h-auto shadow-sm" 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payment Section */}
          {!challan.paid && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                {/* Subsection Headings: 18px */}
                <h3 className="text-lg font-semibold text-gray-900 mb-4 leading-tight">
                  Payment Required
                </h3>
                {/* Buttons/CTAs: 16px */}
                <button
                  onClick={handlePayment}
                  disabled={paying}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-4 px-8 rounded-lg text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 leading-normal flex items-center justify-center space-x-2 mx-auto"
                  aria-label="Pay challan amount online"
                >
                  {paying ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Pay ₹{challan.fineAmount?.toLocaleString()} Online</span>
                    </>
                  )}
                </button>
                
                {/* Payment Info */}
                <div className="mt-4 flex items-center justify-center text-sm text-gray-500 leading-normal">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Secure payment powered by Razorpay
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {paidSuccess && (
            <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-base text-green-800 font-semibold leading-normal">
                ✅ Payment Successful!
              </p>
              <p className="text-sm text-green-700 leading-normal mt-2">
                This challan has been marked as paid in our system.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
