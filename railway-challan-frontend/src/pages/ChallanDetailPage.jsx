import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function ChallanDetailPage() {
  const { id } = useParams();
  const [challan, setChallan] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallan = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/challan/${id}`
        );
        setChallan(res.data.challan);
      } catch {
        setError("Challan not found or server error.");
      } finally {
        setLoading(false);
      }
    };
    fetchChallan();
  }, [id]);

  if (loading)
    return <div className="text-center mt-10 text-blue-700">Loading challan...</div>;
  if (error)
    return <div className="text-center mt-10 text-red-700">{error}</div>;
  if (!challan) return null;

  return (
     <div className="max-w-3xl mx-auto mt-10 mb-8 bg-white border rounded-2xl shadow-lg p-0 overflow-hidden">
      {/* Title & Status Banner */}
      <div className="flex items-center justify-between px-7 py-5 border-b bg-blue-50">
        <div>
          <h2 className="text-2xl font-bold text-[#1E40AF] leading-7">
            Challan Information
          </h2>
          <div className="mt-1 text-sm text-gray-600">
            Challan ID:{" "}
            <span className="font-mono tracking-wide">{challan._id}</span>
          </div>
        </div>
        <span
          className={
            "inline-block py-1 px-4 rounded-lg text-xs font-semibold uppercase tracking-wide " +
            (challan.paid
              ? "bg-green-50 text-green-700 border border-green-300"
              : "bg-red-50 text-red-700 border border-red-300")
          }
        >
          {challan.paid ? "PAID" : "UNPAID"}
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid sm:grid-cols-2 gap-0">
        {/* Passenger Details */}
        <div className="border-b sm:border-b-0 sm:border-r px-7 py-6 bg-slate-50">
          <div className="mb-3 font-semibold text-[#1E40AF]">Passenger Details</div>
          <div className="text-sm">
            <div>
              <span className="font-semibold">Name:</span> {challan.passengerName}
            </div>
            <div>
              <span className="font-semibold">Aadhar Last 4:</span>{" "}
              {challan.passengerAadharLast4 || "—"}
            </div>
            <div>
              <span className="font-semibold">Mobile:</span>{" "}
              {challan.mobileNumber || "—"}
            </div>
          </div>
        </div>

        {/* Train Details */}
        <div className="px-7 py-6 bg-slate-50 border-b">
          <div className="mb-3 font-semibold text-[#1E40AF]">Train Details</div>
          <div className="text-sm">
            <div>
              <span className="font-semibold">Train No.:</span> {challan.trainNumber}
            </div>
            <div>
              <span className="font-semibold">Coach No.:</span> {challan.coachNumber || "—"}
            </div>
            <div>
              <span className="font-semibold">Location:</span> {challan.location}
            </div>
            <div>
              <span className="font-semibold">Date:</span>{" "}
              {new Date(challan.issuedAt || challan.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Offense Details */}
        <div className="px-7 py-6 border-r">
          <div className="mb-3 font-semibold text-[#1E40AF]">Offense Details</div>
          <div className="text-sm">
            <div>
              <span className="font-semibold">Reason:</span> {challan.reason}
            </div>
            <div>
              <span className="font-semibold">Remarks:</span>{" "}
              {challan.remarks || "—"}
            </div>
            <div>
              <span className="font-semibold">Issued By:</span>{" "}
              {challan.issuedBy?.name} ({challan.issuedBy?.employeeId}){" "}
              <span className="text-xs text-slate-500">[{challan.issuedBy?.role}]</span>
            </div>
            <div>
              <span className="font-semibold">Zone:</span>{" "}
              {challan.issuedBy?.zone || "—"}
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="px-7 py-6">
          <div className="mb-3 font-semibold text-[#1E40AF]">Payment Details</div>
          <div className="text-sm">
            <div>
              <span className="font-semibold">Amount:</span> ₹{challan.fineAmount}
            </div>
            <div>
              <span className="font-semibold">Status:</span>{" "}
              <span
                className={
                  challan.paid
                    ? "text-green-700 font-semibold"
                    : "text-red-600 font-semibold"
                }
              >
                {challan.paid ? "Paid" : "Unpaid"}
              </span>
            </div>
            <div>
              <span className="font-semibold">Mode:</span> {challan.paymentMode}
            </div>
            <div>
              <span className="font-semibold">Issue Date:</span>{" "}
              {new Date(challan.issuedAt || challan.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Signature/Proof Section */}
      {(challan.signature || (Array.isArray(challan.proofFiles) && challan.proofFiles.length > 0)) && (
        <div className="px-7 py-5 border-t bg-gray-50 flex flex-col gap-3">
          {challan.signature && (
            <div>
              <div className="font-semibold text-[#1E40AF] mb-1">TTE Signature:</div>
              <img
                src={challan.signature}
                alt="Signature"
                className="border w-36 h-auto mb-1 rounded"
              />
            </div>
          )}
          {Array.isArray(challan.proofFiles) && challan.proofFiles.length > 0 && (
            <div>
              <div className="font-semibold text-[#1E40AF] mb-1">Proof Files:</div>
              <ul className="list-disc pl-6">
                {challan.proofFiles.map((src, i) => (
                  <li key={i}>
                    <a
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 underline"
                    >
                      Proof {i + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 py-5 px-7 flex justify-end border-t bg-slate-50">
        <Link
          to="/view-challans"
          className="bg-gray-200 px-4 py-2 inline-block rounded text-[#1E40AF] hover:bg-gray-300"
        >
          ← Back to Challan List
        </Link>
      </div>
    </div>
  );
}
