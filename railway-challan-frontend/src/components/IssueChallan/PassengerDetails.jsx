import TextInput from '../TextInput';

export default function PassengerDetails({ form, handleChange }) {
  return (
    <>
   <div>
      <h3 className="text-blue-800 text-lg font-semibold mb-3 border-b border-gray-300 pb-1">
        Passenger Details
      </h3>
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <TextInput
          name="trainNumber"
          placeholder="Train Number"
          value={form.trainNumber}
          onChange={handleChange}
          required
          className="flex-1"
        />
        <TextInput
          name="coachNumber"
          placeholder="Coach Number"
          value={form.coachNumber}
          onChange={handleChange}
          required
          className="flex-1"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <TextInput
          name="passengerName"
          placeholder="Passenger Name"
          value={form.passengerName}
          onChange={handleChange}
          required
          className="flex-1"
        />
        <TextInput
          name="passengerAadharLast4"
          placeholder="Aadhar Last 4 Digits"
          maxLength={4}
          value={form.passengerAadharLast4}
          onChange={handleChange}
          className="flex-1"
        />
      </div>
      <TextInput
        name="mobileNumber"
        placeholder="Passenger Mobile Number"
        maxLength={10}
        value={form.mobileNumber}
        onChange={handleChange}
        className="mb-3"
      />
    </div>
    </>
  );
}
