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
        <p className="text-sm font-semibold text-neutral-gray500">Issued At: {new Date(challan.issuedAt).toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).replace(',', '')}</p>
        <p className="text-base font-bold text-primary-blue">{challan._id}</p>
      </div>
      <div className="mt-2.5 flex flex-col w-full space-y-1.5">
        <div>
          <h2 className="text-sm font-semibold text-neutral-gray500">
            Passenger <span className="pl-11 text-base text-neutral-gray900">{challan.passengerName}</span>
          </h2>
        </div>

        <div>
          <p className="text-sm font-semibold text-neutral-gray500">
            Train Number <span className="pl-6 text-base text-neutral-gray900">{challan.trainNumber}</span></p>
        </div>

        <div>
          <p className="text-sm font-semibold text-neutral-gray500">
            Aadhar (Last 4) <span className="pl-3 text-base text-neutral-gray900">{challan.passengerAadharLast4 || "N/A"}</span>
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-neutral-gray500">
            Reason <span className="pl-16 text-base text-secondary-danger-red">{challan.reason}</span>
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-neutral-gray500">
            Fine Amount  <span className="pl-7 text-base text-accent-orange">₹{challan.fineAmount}</span>
          </p>
        </div>
      </div>

      <div className="mt-2 flex flex-row items-center gap-3 py-2 flex-wrap">
        <button
          aria-label="Download as PDF"
          onClick={handleDownload}
          className="bg-secondary-success-green text-white text-sm px-3 sm:px-5 py-1 rounded-md hover:bg-secondary-success-light transition-shadow duration-200 shadow"
        >
          Download PDF
        </button>

        <Link
          to={`/challans/${challan._id}`}
          className="bg-primary-blue text-white text-sm px-2 sm:px-5 py-1 rounded-md hover:bg-primary-dark transition-shadow duration-200 shadow text-center"
        >
          View Details
        </Link>

        {challan.paid ? (
          <span className="px-3 py-1 rounded-xl bg-secondary-success-light/25 text-secondary-success-green font-semibold text-sm ">
            Paid
          </span>
        ) : (
          <span className="px-3 py-1 rounded-xl bg-secondary-danger-light/25 text-secondary-danger-red font-semibold text-sm">
            Unpaid
          </span>
        )}
      </div>

    </div>

  );
};

export default ChallanCard;
