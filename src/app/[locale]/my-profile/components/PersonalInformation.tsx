import React from "react";

const PersonalInformation = () => {
  return (
    <div className="personal-info-wrapper">
      <div className="section-title mb-4">
        <h3 className="text-2xl font-semibold text-gray-900">
          Personal Information
        </h3>
        <p className="text-gray-500 mt-1">
          Update your personal details and preferences
        </p>
      </div>

      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group mb-[24px]">
            <label className="block text-sm text-[#000]/50 font-medium text-gray-700 mb-2">
              Name*
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-[8px] text-[#000] border border-gray-300 focus:outline-none transition-colors"
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group mb-[24px]">
            <label className="block text-sm text-[#000]/50 font-medium text-gray-700 mb-2">
              Phone Number*
            </label>
            <div className="flex gap-4">
              <input
                type="tel"
                className="flex-1 px-4 py-3 rounded-[8px] border border-gray-300 focus:outline-none transition-colors"
                placeholder="Enter phone number"
              />
              <button
                type="button"
                className="px-4 py-3 bg-blue-600 text-white rounded-[8px] hover:bg-blue-700 transition-colors"
              >
                Verify
              </button>
            </div>
          </div>

          <div className="form-group mb-[24px]">
            <label className="block text-sm text-[#000]/50 font-medium text-gray-700 mb-2">
              Secondary Phone
            </label>
            <input
              type="tel"
              className="w-full px-4 py-3 rounded-[8px] text-[#000] border border-gray-300 focus:outline-none transition-colors"
              placeholder="Enter secondary phone number"
            />
          </div>

          <div className="form-group mb-[24px]">
            <label className="block text-sm text-[#000]/50 font-medium text-gray-700 mb-2">
              Email*
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-[8px] text-[#000] border border-gray-300 focus:outline-none transition-colors"
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group mb-[24px] md:col-span-2">
            <label className="block text-sm text-[#000]/50 font-medium text-gray-700 mb-2">
              Address*
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-[8px] text-[#000] border border-gray-300 focus:outline-none transition-colors"
              placeholder="Enter your address"
            />
          </div>

          <div className="form-group mb-[24px]">
            <label className="block text-sm text-[#000]/50 font-medium text-gray-700 mb-2">
              City*
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-[8px] text-[#000] border border-gray-300 focus:outline-none transition-colors"
              placeholder="Enter your city"
            />
          </div>

          <div className="form-group mb-[24px]">
            <label className="block text-sm text-[#000]/50 font-medium text-gray-700 mb-2">
              Country*
            </label>
            <select className="w-full px-4 py-3 rounded-[8px] text-[#000] border border-gray-300 focus:outline-none transition-colors">
              <option value="">Select country</option>
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="CA">Canada</option>
              {/* Add more countries as needed */}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6 ">
          <button
            type="button"
            className="w-[120px] h-[48px] border border-[#FF6625] rounded-[8px] text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-[120px] h-[48px] bg-[#FF6625] text-white rounded-[8px] hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInformation;
