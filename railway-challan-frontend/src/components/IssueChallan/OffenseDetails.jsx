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
    <div className="space-y-3">
      <select
        name="reason"
        value={form.reason}
        onChange={handleReasonChange}
        required
        className="w-full border p-3 rounded-md text-sm"
      >
        <option value="">Select Offense</option>
        {FINE_RULES.map(r =>
          <option key={r.code} value={r.reason}>
            {r.reason} ({r.section})
          </option>
        )}
      </select>

      {form.reason === "Travelling without proper pass/ticket" && (
        <TextInput
          name="fareAmount"
          placeholder="Fare for this journey ₹"
          type="number"
          value={fareAmount}
          onChange={e => setFareAmount(e.target.value)}
        />
      )}

      {form.reason === "Nuisance and Littering" && (
        <>
          <p className='pl-3 font-normal text-sm text-gray-500'>No. of Prior Offenses</p>
          <TextInput
            name="priorOffenses"
            placeholder="No. of prior offences (1 for first time)"
            type="number"
            value={priorOffenses}
            onChange={e => setPriorOffenses(Number(e.target.value || 1))}
          />
        </>
      )}
    </div>
  );
}
