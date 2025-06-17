// src/pages/ViewChallansPage.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ChallanCard from '../components/ChallanCard';

const ViewChallansPage = () => {
  const { token, user } = useAuth();
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalChallans, setTotalChallans] = useState(0);

  useEffect(() => {
    const fetchChallans = async () => {
      try {
        const res = await axios.get(
          user.role === 'admin'
            ? `${import.meta.env.VITE_API_URL}/api/challan/admin/all`
            : `${import.meta.env.VITE_API_URL}/api/challan/my`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log('API Response:', res.data); // Debug log

        // Handle different response structures
        if (user.role === 'admin') {
          setChallans(res.data.challans || []);
          setTotalChallans(res.data.total || 0);
        } else {
          setChallans(Array.isArray(res.data) ? res.data : []);
          setTotalChallans(res.data.length || 0);
        }

      } catch (err) {
        console.error(err);
        setError('Failed to fetch challans');
      } finally {
        setLoading(false);
      }
    };

    fetchChallans();
  }, [token, user.role]);

  // if (loading) return <div className="text-center p-4">Loading...</div>;
  // if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto bg-[#F8FAFC] min-h-screen">
      <h1 className="text-3xl font-bold text-[#1E40AF] mb-4 text-center">Challan History</h1>

      {loading ? (
        <div className="text-center text-sm text-slate-600 py-8">Loading challans...</div>
      ) : error ? (
        <div className="text-center text-[#DC2626] bg-red-50 border border-red-200 rounded p-4 text-sm">{error}</div>
      ) : challans.length === 0 ? (
        <p className="text-center text-slate-500 text-sm">No challans found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
          {challans.map((challan) => (
            <ChallanCard key={challan._id} challan={challan} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewChallansPage;
// This code defines a React component that fetches and displays a list of challans issued by the user or all challans if the user is an admin.
// It uses the AuthContext to get the user's token and role, and makes an API call to fetch the challans.