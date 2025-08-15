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
   <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-2 sm:px-0 font-notosans pt-5">
      <div className="w-full max-w-full sm:max-w-[90vw] md:max-w-[600px] lg:max-w-[50vw]  bg-white rounded-2xl shadow-2xl border border-gray-200 p-7">
        <h2 className="text-2xl font-bold text-blue-800 text-center mb-5  border-b border-gray-200">
          Issue Challan
        </h2>
        {isOffline && (
          <div className="text-yellow-700 bg-yellow-50 border border-yellow-300 rounded mb-2 py-2 px-3 text-xs text-center font-medium">
            ⚠️ You are currently offline. Submitted challans will be saved locally.
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-slate-600">
            {pendingChallans.length
              ? `Pending offline challans: ${pendingChallans.length}`
              : "No offline challans pending."
            }
          </span>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold px-3 py-1 rounded transition disabled:opacity-60"
            onClick={async () => { await syncOfflineChallans(); }}
            disabled={!pendingChallans.length || loading}
            type="button"
            aria-label="Sync offline challans"
          >
            Sync Offline
          </button>
        </div>

        {(error || success) && (
          <div
            ref={messageRef}
            className={`
              mb-3 inline-block w-full px-3 py-2 text-xs rounded font-semibold text-center 
              ${error
                ? "bg-red-100 text-red-700 border border-red-200"
                : "bg-green-100 text-green-700 border border-green-200"
              }
            `}
          >
            {error || success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 w-full">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full text-md font-medium rounded-xl
              py-3 mt-2 shadow-sm transition bg-[#1E40AF] text-white hover:bg-blue-900 disabled:opacity-60"
              aria-label="Issue challan"
          >
            {loading ? "Issuing Challan..." : "Issue Challan"}
          </button>
        </form>
      </div>
    </div>
  );
}
