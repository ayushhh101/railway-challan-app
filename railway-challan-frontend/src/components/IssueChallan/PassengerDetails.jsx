import TextInput from '../TextInput';

export default function PassengerDetails({ form, handleChange }) {
  return (
    <>
      <TextInput
        name="trainNumber"
        placeholder="Train Number"
        value={form.trainNumber}
        onChange={handleChange}
      />
      <TextInput
        name="passengerName"
        placeholder="Passenger Name"
        value={form.passengerName}
        onChange={handleChange}
      />
      <TextInput
        name="passengerAadharLast4"
        placeholder="Passenger Aadhar Number"
        value={form.passengerAadharLast4}
        onChange={handleChange}
        maxLength={12}
      />
      <TextInput
        name="mobileNumber"
        placeholder="Passenger Mobile Number"
        value={form.mobileNumber}
        onChange={handleChange}
      />
    </>
  );
}
