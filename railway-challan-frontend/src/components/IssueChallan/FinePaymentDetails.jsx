import React from 'react';
import TextInput from '../TextInput';

export default function FinePaymentDetails({ form, handleChange }) {
  return (
    <div>
      {/* Section Headings: Mobile 20-22px, Desktop 24-28px */}
      <h2 className="text-xl lg:text-2xl font-semibold text-blue-800 mb-6 pb-3 border-b-2 border-blue-100 leading-tight">
        Fine & Payment Details
      </h2>
      
      <div className="space-y-6">
        {/* Fine Amount & Location - Row on Desktop, Column on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div>
            {/* Form Labels: 14-16px */}
            <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
              Calculated Fine Amount (₹)
            </label>
            <TextInput
              name="fineAmount"
              placeholder="Auto-calculated based on offense"
              type="number"
              value={form.fineAmount}
              readOnly
            />
            <p className="text-xs text-gray-500 mt-2 leading-normal">
              Amount is automatically calculated based on railway rules
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
              Station *
            </label>
            <TextInput
              name="location"
              placeholder="Enter exact location (e.g. Kurla)"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Payment Mode - Mobile Optimized */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
            Payment Mode *
          </label>
          <div className="relative">
            <select
              name="paymentMode"
              value={form.paymentMode}
              onChange={handleChange}
              required
              className="w-full appearance-none border border-gray-300 p-3 sm:p-4 pr-10 rounded-lg text-sm sm:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            >
              <option value="">Select payment method</option>
              <option value="online" className="py-2">
                 Online Payment (UPI/Card/Net Banking)
              </option>
              <option value="offline" className="py-2">
                 Cash Payment
              </option>
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {/* Helper text for mobile users */}
          <p className="text-xs text-gray-500 mt-2 leading-normal">
            Choose how the passenger will pay the fine amount
          </p>
        </div>

        {/* Conditional Payment Status */}
        {form.paymentMode === 'offline' && (
          <div className="bg-green-50 p-4 sm:p-6 rounded-lg border-l-4 border-green-400">
            <h3 className="text-base sm:text-lg font-medium text-green-800 mb-4 leading-tight">
              💵 Cash Payment Confirmation
            </h3>
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="paid"
                checked={form.paid}
                onChange={(e) =>
                  handleChange({ target: { name: 'paid', value: e.target.checked } })
                }
                className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <div>
                {/* Secondary Text: 14px */}
                <span className="text-sm text-gray-700 font-medium leading-normal">
                  Confirm that cash payment has been received
                </span>
                <p className="text-xs text-gray-600 mt-1 leading-normal">
                  Check this box only after receiving the full fine amount in cash
                </p>
              </div>
            </label>
          </div>
        )}

        {form.paymentMode === 'online' && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span className="text-blue-600 text-lg">💡</span>
              </div>
              <p className="text-sm text-blue-700 leading-normal">
                Online payments will be processed through the secure railway payment gateway after challan issuance. The passenger will receive payment instructions via SMS/email.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
