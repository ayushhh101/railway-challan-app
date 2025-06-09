import jsPDF from "jspdf";
import domtoimage from 'dom-to-image';
import { useRef } from "react";

const ChallanCard = ({ challan }) => {

  const handleDownload = async () => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pdf/challan/${challan._id}/pdf`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,  // ✅ Send the token properly
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
    <div className="bg-white shadow-md rounded-xl p-4 mb-4 sm:flex sm:justify-between sm:items-center transition-transform hover:scale-[1.02] duration-200">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-gray-800">
          Passenger: {challan.passengerName}
        </h2>
        <p className="text-sm text-gray-600">
          Aadhar (Last 4): {challan.passengerAadharLast4 || "N/A"}
        </p>
        <p className="text-sm text-gray-600">
          Reason: <span className="font-medium text-red-600">{challan.reason}</span>
        </p>
        <p className="text-sm text-gray-600">
          Fine: ₹{challan.fineAmount}
        </p>
        <p className="text-sm text-gray-600">
          Train Number: {challan.trainNumber}
        </p>
        <p className="text-sm text-gray-600">
          Issued At: {new Date(challan.issuedAt).toLocaleString()}
        </p>
      </div>

      <div className="mt-3 sm:mt-0 sm:text-right">
        <p className="text-sm text-gray-700">
          Issued By: <span className="font-semibold">{challan.issuedBy?.name}</span>
        </p>
        <p className="text-xs text-gray-500">Employee ID: {challan.issuedBy?.employeeId}</p>
        <p className="text-xs text-gray-500">Zone: {challan.issuedBy?.zone}</p>
      </div>
       <button onClick={handleDownload} className="mt-2 bg-green-600 text-white px-3 py-1 rounded">
        Download PDF
      </button>
    </div>
  );
};

export default ChallanCard;
