import React from "react";

const ChallanCard = ({ challan }) => {
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
    </div>
  );
};

export default ChallanCard;
