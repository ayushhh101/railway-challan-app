import jsPDF from "jspdf";
import domtoimage from 'dom-to-image';
import { useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import EditChallanModal from "./EditChallanModal";
import { Link } from "react-router-dom";

const ChallanCard = ({ challan }) => {
  const { user } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const isOwner = user?.employeeId == challan.issuedBy.employeeId;

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pdf/challan/${challan._id}/pdf`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `challan-${challan._id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Could not download PDF. Make sure you're logged in.");
    }
  };

  return (
    <>
      <div className="bg-white shadow-md rounded-xl p-4 sm:p-5 mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-start hover:shadow-lg transition-transform hover:scale-[1.01] duration-200 border border-gray-100">
        {/* Left Block - Passenger Details */}
        <div className="space-y-1 sm:w-2/3">
          <h2 className="text-xl font-semibold text-[#0F172A]">
            Passenger: <span className="text-[#1E40AF]">{challan.passengerName}</span>
          </h2>

          <p className="text-sm text-[#64748B]">
            Aadhar (Last 4): <span className="font-medium">{challan.passengerAadharLast4 || "N/A"}</span>
          </p>

          <p className="text-sm">
            Reason: <span className="text-[#DC2626] font-semibold">{challan.reason}</span>
          </p>

          <p className="text-sm text-[#0F172A] font-medium">
            Fine: <span className="text-[#16A34A] font-bold">₹{challan.fineAmount}</span>
          </p>

          <p className="text-sm text-[#64748B]">Train Number: {challan.trainNumber}</p>
          <p className="text-sm text-[#64748B]">Issued At: {new Date(challan.issuedAt).toLocaleString()}</p>
        </div>

        {/* Right Block - Issuer + Download */}
        <div className="mt-4 sm:mt-0 sm:text-right sm:w-1/3 flex flex-col items-start sm:items-end gap-2">
          <div className="text-sm text-[#0F172A]">
            <p>
              Issued By: <span className="font-semibold">{challan.issuedBy?.name}</span>
            </p>
            <p className="text-xs text-[#64748B]">ID: {challan.issuedBy?.employeeId}</p>
            <p className="text-xs text-[#64748B]">Zone: {challan.issuedBy?.zone}</p>
          </div>

          <button
            onClick={handleDownload}
            className="mt-2 bg-[#16A34A] text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-green-700 transition duration-200 shadow-sm"
          >
            Download PDF
          </button>

          <Link
            to={`/challans/${challan._id}`}
            className="block bg-[#1E40AF] text-white px-3 py-1 mt-2 rounded text-center hover:bg-blue-800 transition"
          >
            View Details
          </Link>
          {/* {isOwner && (
            <button
              onClick={() => setIsEditOpen(true)}
              className="bg-[#1E40AF] text-white text-sm px-4 py-1.5 rounded-md hover:bg-blue-800 transition duration-200"
            >
              Edit Challan
            </button>
          )} */}
        </div>

      </div>

      {isEditOpen && (
        <EditChallanModal
          challan={challan}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </>

  );
};

export default ChallanCard;
