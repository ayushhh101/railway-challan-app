// src/pages/ViewChallansPage.jsx
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import ChallanCard from '../components/ChallanCard';

const ViewChallansPage = () => {
  const { token, user } = useContext(AuthContext);
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchChallans = async () => {
    try {
      const res = await axios.get(
        user.role === 'admin'
          ? '/api/challan/admin/all'
          : '/api/challan/my',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const challanData = user.role === 'admin' ? res.data.challans : res.data;
      setChallans(challanData);

    } catch (err) {
      console.error(err);
      setError('Failed to fetch challans');
    } finally {
      setLoading(false);
    }
  };

  fetchChallans();
}, [token, user.role]);

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Challans History</h1>
      {challans.length === 0 ? (
        <p>No challans found.</p>
      ) : (
        <div className="grid gap-4">
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