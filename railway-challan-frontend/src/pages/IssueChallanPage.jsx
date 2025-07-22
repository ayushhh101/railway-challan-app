import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { saveOfflineChallan, getAllOfflineChallans, clearOfflineChallans, deleteOfflineChallan } from '../utils/db';
import TextInput from '../components/TextInput';
import SignatureCanvas from 'react-signature-canvas';
import { useRef } from 'react';
import { FINE_RULES } from '../utils/fineRules';

export default function IssueChallanPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const sigCanvas = useRef();
  const [signatureData, setSignatureData] = useState('');
  const [pendingChallans, setPendingChallans] = useState([]);
  const [priorOffenses, setPriorOffenses] = useState(1); // for Nuisance & Littering repeat
  const [fareAmount, setFareAmount] = useState(""); // for ticketless travel
  const [proofs, setProofs] = useState([]);
  const messageRef = useRef(null);

  const [form, setForm] = useState({
    trainNumber: '',
    passengerName: '',
    passengerAadharLast4: '',
    mobileNumber: '',
    reason: '',
    fineAmount: '',
    location: '',
    paymentMode: '',
    paid: false,
    signature: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
  if ((error || success) && messageRef.current) {
    messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}, [error, success]);


  const sendNotification = (mobileNumber, message) => {
    console.log(`SMS To: +91${mobileNumber}`);
    console.log(`Message: ${message}`);
  }

  const validateForm = () => {
    // Clear previous errors
    setError('');

    if (!form.trainNumber.trim()) {
      setError("Train Number is required");
      return false;
    }
    if (!/^[A-Za-z0-9\s\-]+$/.test(form.trainNumber)) {
      setError("Train Number contains invalid characters");
      return false;
    }
    if (!form.passengerName.trim()) {
      setError("Passenger Name is required");
      return false;
    }
    if (!/^[A-Za-z\s]+$/.test(form.passengerName)) {
      setError("Passenger Name can only contain letters and spaces");
      return false;
    }
    if (form.passengerAadharLast4) {
      if (!/^\d{4}$/.test(form.passengerAadharLast4)) {
        setError("Aadhar last 4 digits must be exactly 4 digits");
        return false;
      }
    }
    if (form.mobileNumber) {
      if (!/^[6-9]\d{9}$/.test(form.mobileNumber)) {
        setError("Invalid Indian mobile number");
        return false;
      }
    }
    if (!form.reason) {
      setError("Please select a Reason");
      return false;
    }
    if (form.reason === "Travelling without proper pass/ticket") {
      if (!fareAmount || fareAmount <= 0) {
        setError("Please enter a valid Fare Amount");
        return false;
      }
    }
    if (form.reason === "Nuisance and Littering") {
      if (!priorOffenses || !Number.isInteger(priorOffenses) || priorOffenses < 1) {
        setError("Please enter a valid number of prior offenses");
        return false;
      }
    }
    if (!form.fineAmount || form.fineAmount <= 0) {
      setError("Fine Amount must be greater than zero");
      return false;
    }
    if (!form.location.trim()) {
      setError("Location is required");
      return false;
    }
    if (!form.paymentMode) {
      setError("Please select a Payment Mode");
      return false;
    }
    if (proofs.length > 4) {
      setError("You can upload up to 4 proof files only");
      return false;
    }
    for (const file of proofs) {
      if (file.size > 2 * 1024 * 1024) {
        setError(`File ${file.name} exceeds 2MB size limit`);
        return false;
      }
    }

    return true;
  }


  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 4000); // 4 seconds visible
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  async function refreshPendingChallans() {
    setPendingChallans(await getAllOfflineChallans());
  }

  const isDuplicateChallan = (a, b) => (
    a.trainNumber === b.trainNumber &&
    a.passengerName === b.passengerName &&
    a.reason === b.reason
  );

  useEffect(() => { refreshPendingChallans(); }, []);

  useEffect(() => {
    const syncOfflineChallans = async () => {
      if (!navigator.onLine || !token) return;

      const pending = await getAllOfflineChallans();
      console.log("Offline challans found:", pending);
      if (pending.length === 0) return;

      const failedLogs = [];

      for (const challan of pending) {
        try {
          await axios.post(
            `${import.meta.env.VITE_API_URL}/api/challan/issue`,
            challan,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log(" Synced challan:", challan);
          await deleteOfflineChallan(challan.id);
        } catch (err) {
          console.error('Sync failed for challan:', challan, err);
          failedLogs.push({ challan, error: err.message });
        }
        refreshPendingChallans();
      }

      await clearOfflineChallans();

      // store sync failures in localStorage for debugging
      if (failedLogs.length > 0) {
        localStorage.setItem('syncErrors', JSON.stringify(failedLogs));
      } else {
        localStorage.removeItem('syncErrors');
      }

    };

    const handleOnline = () => {
      setIsOffline(false);
      setTimeout(() => syncOfflineChallans(), 500);
    };

    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setTimeout(() => {
      if (navigator.onLine && token) {
        syncOfflineChallans();
      }
    }, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [token]);

  const handleReasonChange = (e) => {
    const selectedReason = e.target.value;
    setForm(f => ({ ...f, reason: selectedReason }));
    const rule = FINE_RULES.find(r => r.reason === selectedReason);

    if (rule) {
      let fine = 0;
      if (rule.reason === "Travelling without proper pass/ticket") {
        // Wait for fareAmount as separate field (ask in UI)
        fine = rule.autofill(fareAmount || 0);
      } else if (rule.reason === "Nuisance and Littering") {
        fine = rule.autofill(priorOffenses);
      } else {
        fine = rule.autofill();
      }
      setForm(f => ({ ...f, fineAmount: fine }));
    }
  };

  // If fareAmount/priorOffenses changes, update fineAmount too (reactive)
  useEffect(() => {
    if (form.reason === "Travelling without proper pass/ticket") {
      const rule = FINE_RULES.find(r => r.reason === form.reason);
      setForm(f => ({ ...f, fineAmount: rule.autofill(fareAmount || 0) }));
    }
    if (form.reason === "Nuisance and Littering") {
      const rule = FINE_RULES.find(r => r.reason === form.reason);
      setForm(f => ({ ...f, fineAmount: rule.autofill(priorOffenses) }));
    }

  }, [fareAmount, priorOffenses]);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) {
      return setLoading(false);
    }
    setLoading(true);

    const signatureImage = sigCanvas.current.isEmpty()
      ? ''
      : sigCanvas.current.getCanvas().toDataURL('image/png');

    const challanData = {
      ...form,
      issuedBy: user?._id,
      date: new Date().toISOString(),
      signature: signatureImage,
      proofFiles: [],
    };

    try {
      if (!navigator.onLine) {
        const all = await getAllOfflineChallans();
        if (all.some(e => isDuplicateChallan(challanData, e))) {
          setError('A similar offline challan is already queued.');
          setLoading(false);
          return;
        }
        await saveOfflineChallan(challanData);
        setSuccess('Challan saved offline. Will sync when back online.');
        refreshPendingChallans();
      } else {

        const formData = new FormData();
        for (const [key, value] of Object.entries({
          ...form,
          issuedBy: user?._id,
          date: new Date().toISOString(),
          signature: signatureImage,
        })) {
          formData.append(key, value);
        }
        proofs.forEach(file => formData.append("proofs", file));

        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/challan/issue`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setSuccess('Challan issued successfully!');

        sendNotification(
          challanData.mobileNumber,
          `Dear ${challanData.passengerName}, a challan of ₹${challanData.fineAmount} has been issued at ${challanData.location} for ${challanData.reason}. Challan Status : ${challanData.paid ? "Paid" : "Not Paid "}`
        );
        setProofs([]);
      }
      setForm({
        trainNumber: '',
        passengerName: '',
        passengerAadharLast4: '',
        mobileNumber: '',
        reason: '',
        fineAmount: '',
        location: '',
        paymentMode: '',
        paid: false
      });
      if (messageRef.current) {
        messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      // setTimeout(() => navigate('/view-challans'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue challan');
      if (messageRef.current) {
        messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } finally {
      setLoading(false);
    }
  };

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


      <form onSubmit={handleSubmit} className="grid gap-3 sm:gap-5">
        <TextInput name="trainNumber" placeholder="Train Number" value={form.trainNumber} onChange={handleChange} />
        <TextInput name="passengerName" placeholder="Passenger Name" value={form.passengerName} onChange={handleChange} />
        <TextInput name="passengerAadharLast4" placeholder="Passenger Aadhar Number" value={form.passengerAadharLast4} onChange={handleChange} maxLength={12} />
        <TextInput name="mobileNumber" placeholder="Passenger Mobile Number" value={form.mobileNumber} onChange={handleChange} />
        {/* Reason select with autofill */}
        <select
          name="reason"
          value={form.reason}
          onChange={handleReasonChange}
          required
          className="w-full border p-3 rounded-md text-sm"
        >
          <option value="">Select Offense</option>
          {FINE_RULES.map(r =>
            <option key={r.code} value={r.reason}>
              {r.reason} ({r.section})
            </option>
          )}
        </select>

        {/* Fare for Ticketless travel */}
        {form.reason === "Travelling without proper pass/ticket" && (
          <TextInput
            name="fareAmount"
            placeholder="Fare for this journey ₹"
            type="number"
            value={fareAmount}
            onChange={e => setFareAmount(e.target.value)}
          />
        )}

        {/* Nuisance/Littering prior offences field */}
        {form.reason === "Nuisance and Littering" && (
          <>
            <p className='pl-3 font-normal text-sm text-gray-500'>No. of Prior Offenses</p>
            <TextInput
              name="priorOffenses"
              placeholder="No. of prior offences (1 for first time)"
              type="number"
              value={priorOffenses}
              onChange={e => setPriorOffenses(Number(e.target.value || 1))}
            />
          </>
        )}

        {/* Fine Amount (readonly, autofilled!) */}
        <p className='pl-2 pt-0 font-normal text-sm text-gray-500'>Select Fine Amount :</p>
        <TextInput
          name="fineAmount"
          placeholder="Fine Amount"
          type="number"
          value={form.fineAmount}
          readOnly
        />
        <TextInput name="location" placeholder="Location" value={form.location} onChange={handleChange} />

        <select
          name="paymentMode"
          value={form.paymentMode}
          onChange={handleChange}
          required
          className="w-full border p-3 rounded-md text-sm"
        >
          <option value="">Select Payment Mode</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>

        {form.paymentMode === 'offline' && (
          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              name="paid"
              checked={form.paid}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  paid: e.target.checked,
                }))
              }
            />
            Mark as Paid
          </label>
        )}
        <div>
          <label className="text-sm font-medium">Digital Signature</label>
          <div className="border rounded-md p-2 bg-gray-50">
            <SignatureCanvas
              penColor="black"
              ref={sigCanvas}
              canvasProps={{
                width: 450,
                height: 150, className: 'bg-white rounded border w-full'
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => sigCanvas.current.clear()}
            className="text-sm text-red-600 mt-2 underline"
          >
            Clear Signature
          </button>
        </div>

        <div>
          <label className="text-sm font-medium">
            Attach Proof (Photo/PDF, optional, up to 4)
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            capture="environment"
            multiple
            disabled={isOffline}
            onChange={e => setProofs(Array.from(e.target.files))}
            className="block mt-1"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {proofs.map((file, idx) => (
              <span key={idx} className="text-xs px-2 py-1 bg-slate-100 rounded">
                {file.name}
              </span>
            ))}
          </div>
          {isOffline && (
            <p className="text-xs text-orange-600 mt-1">
              Proof/photo uploads available only when online.
            </p>
          )}
        </div>

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
