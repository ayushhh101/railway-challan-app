import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function VerifyChallan() {
  const { id } = useParams();
  const [challan, setChallan] = useState(null);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);

  useEffect(() => {
    const fetchChallan = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/challan/${id}`);
        setChallan(res.data.challan);
      } catch (err) {
        setError('Challan not found or invalid link');
      }
    };
    fetchChallan();
  }, [id, paidSuccess]);

   const handlePayment = async () => {
    setPaying(true);
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/challan/pay/${id}`);
      setPaidSuccess(true);
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment failed. Try again.');
    } finally {
      setPaying(false);
    }
  };

  if (error) return <div className="text-center text-red-600 mt-10">{error}</div>;
  if (!challan) return <div className="text-center mt-10">Loading challan...</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white border rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-center mb-4 text-[#1E40AF]">Challan Verification</h2>
      <p><strong>Passenger:</strong> {challan.passengerName}</p>
      <p><strong>Challan ID:</strong> {challan._id}</p>
      <p><strong>Train Number:</strong> {challan.trainNumber}</p>
      <p><strong>Reason:</strong> {challan.reason}</p>
      <p><strong>Fine:</strong> ₹{challan.fineAmount}</p>
      <p>
        <strong>Status:</strong>{' '}
        <span className={challan.paid ? 'text-green-600' : 'text-red-600'}>
          {challan.paid ? 'Paid' : 'Unpaid'}
        </span>
      </p>
      {challan.signature && (
        <div className="mt-4">
          <p className="font-semibold">TTE Signature:</p>
          <img src={challan.signature} alt="Signature" className="border w-40 h-auto mt-2" />
        </div>
      )}

       {!challan.paid && (
        <div className="mt-6 text-center">
          <button
            onClick={handlePayment}
            disabled={paying}
            className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
          >
            {paying ? 'Processing Payment...' : `Pay ₹${challan.fineAmount} Online`}
          </button>
        </div>
      )}
      {paidSuccess && (
        <p className="text-green-700 mt-4 text-center font-semibold">✅ Payment successful! This challan is now marked as paid.</p>
      )}
    </div>
  );
}
