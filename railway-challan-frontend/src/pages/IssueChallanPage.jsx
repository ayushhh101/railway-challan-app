import { useAuth } from '../context/AuthContext';
import PassengerDetails from '../components/IssueChallan/PassengerDetails';
import OffenseDetails from '../components/IssueChallan/OffenseDetails';
import FinePaymentDetails from '../components/IssueChallan/FinePaymentDetails';
import DigitalSignature from '../components/IssueChallan/DigitalSignature';
import AttachProof from '../components/IssueChallan/AttachProof';
import useIssueChallan from '../hooks/useChallan';

export default function IssueChallanPage() {
  const { user, token } = useAuth();
  const sendNotification = (mobileNumber, message) => {
    console.log(`SMS To: +91${mobileNumber}`);
    console.log(`Message: ${message}`);
  }

  const {
    form,
    setForm,
    proofs,
    setProofs,
    loading,
    error,
    success,
    isOffline,
    priorOffenses,
    setPriorOffenses,
    fareAmount,
    setFareAmount,
    handleChange,
    handleReasonChange,
    handleSubmit,
    refreshPendingChallans,
    pendingChallans,
    messageRef,
    sigCanvas,
  } = useIssueChallan(user, token, sendNotification);

  return (
    <div
      className="min-h-screen bg-gray-50 px-4 py-6 lg:px-8 lg:py-12"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">

          {/* Page Title: Mobile 24-28px, Desktop 32-36px */}
          <div className="bg-white px-6 pt-7 lg:px-8 ">
            <h1 className="text-2xl lg:text-4xl font-bold text-black text-center leading-tight">
              Issue Railway Challan
            </h1>
            {/* Secondary Text: 14px with underline */}
            <div className="flex flex-col items-center mt-4">
              <p className="text-sm text-gray-600 text-center leading-normal">
                Complete the form below to issue a new challan
              </p>
              <div className="w-full h-0.5 bg-blue-600 mt-2"></div>
            </div>
          </div>


          <div className="p-6 lg:p-8">
            {/* Offline Status Alert */}
            {isOffline && (
              <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="text-yellow-500 text-xl">⚠️</span>
                  </div>
                  <div className="ml-3">
                    {/* Secondary Text: 14px */}
                    <p className="text-sm text-yellow-700 font-medium leading-normal">
                      You are currently offline. Submitted challans will be saved locally and synced when connection is restored.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sync Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8  bg-gray-50 rounded-lg space-y-3 sm:space-y-0">
              {/* Secondary Text: 14px */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-600 leading-normal">
                  {pendingChallans.length
                    ? `${pendingChallans.length} challan(s) pending sync`
                    : "All challans synced"
                  }
                </span>
              </div>
              {/* Buttons/CTAs: 16px */}
              <button
                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white text-base font-medium px-6 rounded-lg transition-colors duration-200 disabled:opacity-60 leading-normal p-1.5"
                onClick={async () => { await syncOfflineChallans(); }}
                disabled={!pendingChallans.length || loading}
                type="button"
                aria-label="Sync offline challans"
              >
                {loading ? "Syncing..." : "Sync Offline Challans"}
              </button>
            </div>

            {/* Error/Success Messages */}
            {(error || success) && (
              <div
                ref={messageRef}
                className={`
                mb-8 p-4 rounded-lg text-sm font-medium text-center leading-normal
                ${error
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                  }
              `}
              >
                {error || success}
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-10">
              <PassengerDetails form={form} handleChange={handleChange} />
              <OffenseDetails
                form={form}
                fareAmount={fareAmount}
                setFareAmount={setFareAmount}
                priorOffenses={priorOffenses}
                setPriorOffenses={setPriorOffenses}
                handleReasonChange={handleReasonChange}
              />
              <FinePaymentDetails form={form} handleChange={handleChange} />
              <DigitalSignature sigCanvasRef={sigCanvas} />
              <AttachProof proofs={proofs} setProofs={setProofs} isOffline={isOffline} />

              {/* Submit Button - Buttons/CTAs: 16px */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-blue hover:bg-primary-light disabled:bg-blue-400 text-white text-base font-semibold py-4 rounded-xl transition-colors duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 leading-normal"
                  aria-label="Issue challan"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Issuing Challan...
                    </div>
                  ) : (
                    "Issue Challan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

}
