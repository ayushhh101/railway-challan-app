import React from 'react';
import TextInput from '../TextInput';

export default function FinePaymentDetails({ form, handleChange }) {
  return (
    <div className="space-y-4">
      <div>
        <p className='pl-2 pt-0 font-normal text-sm text-gray-500'>Select Fine Amount :</p>
        <TextInput
          name="fineAmount"
          placeholder="Fine Amount"
          type="number"
          value={form.fineAmount}
          readOnly
        />
      </div>
      <TextInput
        name="location"
        placeholder="Location"
        value={form.location}
        onChange={handleChange}
      />
      <select
        name="paymentMode"
        value={form.paymentMode}
        onChange={handleChange}
        required
        className="w-full border p-3 rounded-md text-sm"
      >
        <option value="">Select Payment Mode</option>
        <option value="online">Online</option>
        <option value="offline">Offline</option>
      </select>
      {form.paymentMode === 'offline' && (
        <label className="text-sm flex items-center gap-2">
          <input
            type="checkbox"
            name="paid"
            checked={form.paid}
            onChange={(e) =>
              handleChange({ target: { name: 'paid', value: e.target.checked } })
            }
          />
          Mark as Paid
        </label>
      )}
    </div>
  );
}
