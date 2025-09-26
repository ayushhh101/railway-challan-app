import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import EditChallanModal from "./EditChallanModal";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const ChallanCard = ({ challan }) => {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    const toastId = toast.loading("Preparing PDF...");
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
      toast.success("Download started!", { id: toastId });
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Could not download PDF. Make sure you're logged in.", {
        id: toastId,
      });
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(',', '');
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Card Header */}
      <div className="flex justify-between sm:flex-row sm:items-start sm:justify-between mb-6 space-y-2 sm:space-y-0">
        <div>
          {/* Small Text: 12px */}
          <p className="text-xs text-gray-500 leading-normal mb-1">
            Issued At
          </p>
          {/* Secondary Text: 14px */}
          <p className="text-sm font-semibold text-gray-700 leading-normal">
            {formatDate(challan.issuedAt)}
          </p>
        </div>

        <div className="flex gap-1 ">
          <div className="text-center">
            {/* Small Text: 12px */}
            <p className="text-xs text-gray-500 leading-normal mb-1">
              Challan ID
            </p>
            {/* Secondary Text: 14px */}
            <p className="text-sm font-bold text-blue-600 leading-normal break-all">
              #{challan._id.slice(-8).toUpperCase()}
            </p>
          </div>
          {/* Payment Status */}
          <div className="flex justify-center mb-6">
            {challan.paid ? (
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-semibold leading-normal">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Paid
              </span>
            ) : (
              <span className="inline-flex items-center p-1 md:px-4 md:py-2 rounded-full bg-red-100 text-red-800 md:text-sm text-xs font-semibold leading-normal">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                Unpaid
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Passenger Information */}
      <div className="space-y-3 ">
        {/* Passenger Name */}
        <div className="flex flex-col sm:flex-row sm:items-center">
          <div className="flex-shrink-0 w-full sm:w-20 mb-1 sm:mb-0">
            {/* Form Labels: 14px */}
            <span className="text-sm font-medium text-gray-600 leading-normal">
              Passenger:
            </span>
          </div>
          <div className="">
            {/* Body Text: 16px */}
            <span className="text-base font-semibold text-gray-900 leading-normal">
              {challan.passengerName}
            </span>
          </div>
        </div>

        {/* Train Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex-shrink-0 w-full sm:w-10 mb-1 sm:mb-0">
              <span className="text-sm font-medium text-gray-600 leading-normal">
                Train:
              </span>
            </div>
            <div className="flex-1">
              <span className="text-base font-semibold text-gray-900 leading-normal">
                {challan.trainNumber}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex-shrink-0 w-full sm:w-14 mb-1 sm:mb-0">
              <span className="text-sm font-medium text-gray-600 leading-normal">
                Aadhar:
              </span>
            </div>
            <div className="flex-1">
              <span className="text-base font-semibold text-gray-900 leading-normal">
                ****{challan.passengerAadharLast4 || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Offense Information */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex flex-col space-y-2">
            <div>
              <span className="text-sm font-medium text-red-600 leading-normal">
                Offense
              </span>
              {/* Body Text: 16px */}
              <p className="text-base font-semibold text-red-700 leading-normal mt-1">
                {challan.reason}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-red-600 leading-normal">
                Fine Amount
              </span>
              {/* Body Text: 16px */}
              <p className="text-base font-bold text-red-800 leading-normal mt-1">
                ₹{challan.fineAmount?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
        {/* Buttons/CTAs: 16px */}
        <button
          aria-label="Download as PDF"
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-base font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 leading-normal"
        >
          {downloading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Downloading...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </div>
          )}
        </button>

        <Link
          to={`/challans/${challan._id}`}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center leading-normal"
        >
          <div className="flex items-center justify-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Details
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ChallanCard;
