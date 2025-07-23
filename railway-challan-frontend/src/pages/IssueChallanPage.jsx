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
    <div className="w-full max-w-md mx-auto sm:max-w-xl p-2 sm:p-6 mt-8 min-h-screen bg-white shadow-lg rounded-xl border border-slate-200 overflow-x-hidden">
      <h2 className="text-xl sm:text-2xl font-bold mb-5 text-[#1E40AF] text-center">Issue Challan</h2>

      {/* offline Badge */}
      {isOffline && (
        <p className="text-center w-full text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-300 rounded p-2 mb-4">
          ⚠️ You are currently offline. Submitted challans will be saved locally.
        </p>
      )}

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-600">
          {pendingChallans.length > 0
            ? `Pending offline challans: ${pendingChallans.length}`
            : "No offline challans pending."}
        </span>
        <button
          className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 text-xs font-bold"
          onClick={async () => { await syncOfflineChallans(); }}
          disabled={pendingChallans.length === 0 || loading}
        >
          Sync Offline Challans
        </button>
      </div>


      {(error || success) && (
        <div
          ref={messageRef}
          className={`p-2 mb-4 rounded text-center text-sm font-medium ${error
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-green-50 text-green-700 border border-green-200'
            }`}
          role="alert"
        >
          {error || success}
        </div>
      )}


      <form onSubmit={handleSubmit} className="grid gap-3 sm:gap-4">
        
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
          className="bg-[#1E40AF] text-white py-2 sm:py-3 rounded-md text-base font-medium hover:bg-blue-900 transition"
        >
          {loading ? 'Issuing Challan...' : 'Issue Challan'}

        </button>

      </form>
    </div>

  );
}
