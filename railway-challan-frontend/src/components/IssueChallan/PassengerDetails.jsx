import TextInput from '../TextInput';

export default function PassengerDetails({ form, handleChange }) {
  return (
    <div>
      {/* Section Headings: Mobile 20-22px, Desktop 24-28px */}
      <h2 className="text-xl lg:text-2xl font-semibold text-blue-800 mb-6 pb-3 border-b-2 border-blue-100 leading-tight">
        Passenger Details
      </h2>
      
      <div className="space-y-6">
        {/* Train & Coach - Row on Desktop, Column on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div>
            {/* Form Labels: 14-16px */}
            <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
              Train Number *
            </label>
            <TextInput
              name="trainNumber"
              placeholder="Enter train number (e.g., 12345)"
              value={form.trainNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
              Coach Number *
            </label>
            <TextInput
              name="coachNumber"
              placeholder="Enter coach (e.g., S1, B2)"
              value={form.coachNumber}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Passenger Name & Aadhar - Row on Desktop, Column on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
              Passenger Full Name *
            </label>
            <TextInput
              name="passengerName"
              placeholder="Enter passenger's full name"
              value={form.passengerName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
              Aadhar Last 4 Digits
            </label>
            <TextInput
              name="passengerAadharLast4"
              placeholder="Last 4 digits of Aadhar"
              maxLength={4}
              value={form.passengerAadharLast4}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Mobile Number - Full Width */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
            Mobile Number
          </label>
          <TextInput
            name="mobileNumber"
            placeholder="Enter 10-digit mobile number"
            maxLength={10}
            value={form.mobileNumber}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
}
