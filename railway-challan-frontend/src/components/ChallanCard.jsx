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

  return (
    <div className="bg-white shadow-md rounded-xl p-4 sm:p-5 mb-4 hover:shadow-lg transition-transform hover:scale-[1.01] duration-200 border border-gray-100">
      <div className="flex flex-row justify-between">
        <p className="text-sm font-semibold text-[#64748B]">Issued At: {new Date(challan.issuedAt).toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).replace(',', '')}</p>
        <p className="text-base font-bold text-[#1E40AF]">{challan._id}</p>
      </div>
      <div className="mt-2.5 flex flex-col w-full space-y-1.5">
        <div>
          <h2 className="text-sm font-semibold text-[#64748B]">
            Passenger <span className="pl-11 text-base text-black">{challan.passengerName}</span>
          </h2>
        </div>

        <div>
          <p className="text-sm font-semibold text-[#64748B]">
            Train Number <span className="pl-6 text-base text-black">{challan.trainNumber}</span></p>
        </div>

        <div>
          <p className="text-sm font-semibold text-[#64748B]">
            Aadhar (Last 4) <span className="pl-3 text-base ">{challan.passengerAadharLast4 || "N/A"}</span>
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-[#64748B]">
            Reason <span className="pl-16 text-base text-[#DC2626]">{challan.reason}</span>
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-[#64748B]">
            Fine Amount  <span className="pl-7 text-base text-yellow-600">₹{challan.fineAmount}</span>
          </p>
        </div>
      </div>

      <div className="mt-2 flex flex-row items-center gap-3 py-2">
        <button
          aria-label="Download as PDF"
          onClick={handleDownload}
          className="bg-[#16A34A] text-white text-sm px-4 py-1 rounded-md hover:bg-green-700 transition-shadow duration-200 shadow"
        >
          Download PDF
        </button>

        <Link
          to={`/challans/${challan._id}`}
          className="bg-[#1E40AF] text-white text-sm px-4 py-1 rounded-md hover:bg-blue-800 transition-shadow duration-200 shadow text-center"
        >
          View Details
        </Link>

        {challan.paid ? (
          <span className="px-4 py-1 rounded-md bg-green-100 text-green-700 font-semibold text-sm ">
            Paid
          </span>
        ) : (
          <span className="px-4 py-1 rounded-md bg-red-100 text-red-700 font-semibold text-sm ">
            Unpaid
          </span>
        )}
      </div>

    </div>

  );
};

export default ChallanCard;
