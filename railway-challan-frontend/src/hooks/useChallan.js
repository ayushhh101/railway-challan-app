import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { saveOfflineChallan, getAllOfflineChallans, clearOfflineChallans, deleteOfflineChallan } from '../utils/db';
import { FINE_RULES } from '../utils/fineRules';

export default function useIssueChallan(user, token, sendNotification) {
  const sigCanvas = useRef();
  const messageRef = useRef(null);

  const [pendingChallans, setPendingChallans] = useState([]);
  const [priorOffenses, setPriorOffenses] = useState(1); // for nuisance & littering
  const [fareAmount, setFareAmount] = useState(""); // for ticketless travel
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const [form, setForm] = useState({
    trainNumber: '',
    coachNumber: '',
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

  const isDuplicateChallan = (a, b) => (
    a.trainNumber === b.trainNumber &&
    a.passengerName === b.passengerName &&
    a.reason === b.reason
  );

  const refreshPendingChallans = async () => setPendingChallans(await getAllOfflineChallans());

  useEffect(() => { refreshPendingChallans(); }, []);


  // Offline sync logic, window event listeners, etc.
  const syncOfflineChallans = useCallback(async () => {
    if (!navigator.onLine || !token) return;

    const pending = await getAllOfflineChallans();
    if (pending.length === 0) return;

    setSyncLoading(true);
    const failedLogs = [];
    let successCount = 0;

    for (const challan of pending) {
      try {
        // FIXED: Convert to FormData format (same as online submission)
        const formData = new FormData();
        formData.append('trainNumber', challan.trainNumber || '');
        formData.append('coachNumber', challan.coachNumber || '');
        formData.append('passengerName', challan.passengerName || '');
        formData.append('passengerAadharLast4', challan.passengerAadharLast4 || '');
        formData.append('mobileNumber', challan.mobileNumber || '');
        formData.append('reason', challan.reason || '');
        formData.append('fineAmount', challan.fineAmount || '');
        formData.append('location', challan.location || '');
        formData.append('paymentMode', challan.paymentMode || '');
        formData.append('paid', challan.paid || false);
        formData.append('signature', challan.signature || '');

        // Handle proof files if any (though offline probably won't have files)
        if (challan.proofFiles && challan.proofFiles.length > 0) {
          challan.proofFiles.forEach(file => formData.append("proofFiles", file));
        }

        await axios.post(`${import.meta.env.VITE_API_URL}/api/challan/issue`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type - let browser set it for FormData
          }
        });

        console.log("✅ Synced challan:", challan);
        await deleteOfflineChallan(challan.id || challan._id);
        successCount++;
      } catch (err) {
        console.error('❌ Sync failed for challan:', challan, err);
        console.error('❌ Error response:', err.response?.data); // Log server error details
        failedLogs.push({ challan, error: err.response?.data?.message || err.message });
      }
    }

    await refreshPendingChallans();

    if (failedLogs.length > 0) {
      localStorage.setItem('syncErrors', JSON.stringify(failedLogs));
    } else {
      localStorage.removeItem('syncErrors');
    }

    setSyncLoading(false);
    return { total: pending.length, failed: failedLogs.length, success: successCount };
  }, [token]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // FIXED: Add slight delay for network stabilization
      setTimeout(() => {
        syncOfflineChallans();
      }, 500);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync attempt if already online
    if (navigator.onLine && token) {
      syncOfflineChallans();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [token, syncOfflineChallans]);

  useEffect(() => {
    if ((error || success) && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [error, success]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

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

  const validateForm = () => {
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

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleReasonChange = e => {
    const selectedReason = e.target.value;
    setForm(f => ({ ...f, reason: selectedReason }));
    const rule = FINE_RULES.find(r => r.reason === selectedReason);

    if (rule) {
      let fine = 0;
      if (rule.reason === "Travelling without proper pass/ticket") {
        //Wait for fareAmount as separate field (ask in ui)
        fine = rule.autofill(fareAmount || 0);
      } else if (rule.reason === "Nuisance and Littering") {
        fine = rule.autofill(priorOffenses);
      } else {
        fine = rule.autofill();
      }
      setForm(f => ({ ...f, fineAmount: fine }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) {
      return setLoading(false);
    }
    setLoading(true);

    const signatureImage = sigCanvas.current.isEmpty() ? '' : sigCanvas.current.getCanvas().toDataURL('image/png');

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
          trainNumber: form.trainNumber,
          coachNumber: form.coachNumber,
          passengerName: form.passengerName,
          passengerAadharLast4: form.passengerAadharLast4,
          mobileNumber: form.mobileNumber,
          reason: form.reason,
          fineAmount: form.fineAmount,
          location: form.location,
          paymentMode: form.paymentMode,
          paid: form.paid,
          signature: signatureImage
        })) {
          formData.append(key, value);
        }
        proofs.forEach(file => formData.append("proofFiles", file));

        await axios.post(`${import.meta.env.VITE_API_URL}/api/challan/issue`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
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
        coachNumber: '',
        passengerAadharLast4: '',
        mobileNumber: '',
        reason: '',
        fineAmount: '',
        location: '',
        paymentMode: '',
        paid: false,
        signature: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue challan');
    } finally {
      setLoading(false);
    }
  };

  return {
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
    syncOfflineChallans,
    syncLoading
  };
}
