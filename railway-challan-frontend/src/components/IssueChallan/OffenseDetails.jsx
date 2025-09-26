import React from 'react';
import TextInput from '../TextInput';
import { FINE_RULES } from '../../utils/fineRules';

export default function OffenseDetails({
  form,
  fareAmount,
  setFareAmount,
  priorOffenses,
  setPriorOffenses,
  handleReasonChange
}) {
  return (
    <div>
      {/* Section Headings: Mobile 20-22px, Desktop 24-28px */}
      <h2 className="text-xl lg:text-2xl font-semibold text-blue-800 mb-6 pb-3 border-b-2 border-blue-100 leading-tight">
        Offense Details
      </h2>
      
      <div className="space-y-6">
        {/* Offense Selection - Mobile Optimized */}
        <div>
          {/* Form Labels: 14-16px */}
          <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
            Select Offense Type *
          </label>
          <div className="relative">
            <select
              name="reason"
              value={form.reason}
              onChange={handleReasonChange}
              required
              className="w-full appearance-none border border-gray-300 p-3 sm:p-4 pr-10 rounded-lg text-sm sm:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            >
              <option value="">Choose an offense from the list</option>
              {FINE_RULES.map(r =>
                <option key={r.code} value={r.reason} className="py-2">
                  {r.reason} ({r.section})
                </option>
              )}
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {/* Small Text: 12px */}
          <p className="text-xs text-gray-500 mt-2 leading-normal">
            Select the most appropriate offense category from the dropdown
          </p>
        </div>

        {/* Conditional Fields */}
        {form.reason === "Travelling without proper pass/ticket" && (
          <div className="bg-blue-50 p-4 sm:p-6 rounded-lg border-l-4 border-blue-400">
            <h3 className="text-base sm:text-lg font-medium text-blue-800 mb-4 leading-tight">
              Additional Information Required
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
                Journey Fare Amount (₹) *
              </label>
              <TextInput
                name="fareAmount"
                placeholder="Enter the actual fare for this journey"
                type="number"
                value={fareAmount}
                onChange={e => setFareAmount(e.target.value)}
                required
              />
              <p className="text-xs text-gray-600 mt-2 leading-normal">
                This amount will be used to calculate the penalty as per railway rules
              </p>
            </div>
          </div>
        )}

        {form.reason === "Nuisance and Littering" && (
          <div className="bg-orange-50 p-4 sm:p-6 rounded-lg border-l-4 border-orange-400">
            <h3 className="text-base sm:text-lg font-medium text-orange-800 mb-4 leading-tight">
              Repeat Offense Information
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
                Number of Prior Offenses *
              </label>
              {/* Secondary Text: 14px */}
              <p className="text-sm text-gray-600 mb-3 leading-normal">
                Enter the total number of previous similar offenses (including this one)
              </p>
              <TextInput
                name="priorOffenses"
                placeholder="Enter 1 for first-time offense"
                type="number"
                min="1"
                value={priorOffenses}
                onChange={e => setPriorOffenses(Number(e.target.value || 1))}
                required
              />
              <p className="text-xs text-gray-600 mt-2 leading-normal">
                Fine amount increases with repeat offenses
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
