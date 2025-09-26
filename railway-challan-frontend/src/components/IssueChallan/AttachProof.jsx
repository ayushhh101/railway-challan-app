import React from 'react';

export default function AttachProof({ proofs, setProofs, isOffline }) {
  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 4) {
      alert('Maximum 4 files allowed');
      return;
    }
    setProofs(files);
  };

  const removeFile = (indexToRemove) => {
    setProofs(proofs.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div>
      {/* Section Headings: Mobile 20-22px, Desktop 24-28px */}
      <h2 className="text-xl lg:text-2xl font-semibold text-blue-800 mb-6 pb-3 border-b-2 border-blue-100 leading-tight">
        Attach Evidence
      </h2>
      
      <div className="space-y-6">
        {/* Upload Section */}
        <div>
          {/* Form Labels: 14-16px */}
          <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
            Upload Photos or Documents (Optional)
          </label>
          {/* Secondary Text: 14px */}
          <p className="text-sm text-gray-600 mb-4 leading-normal">
            You can attach up to 4 files as evidence. Supported formats: JPG, PNG, PDF (Max 5MB each)
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
            <input
              type="file"
              accept="image/*,application/pdf"
              capture="environment"
              multiple
              disabled={isOffline}
              onChange={handleFilesChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-60 leading-normal cursor-pointer"
            />
          </div>
        </div>
        
        {/* File Preview */}
        {proofs.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4 leading-tight">
              Selected Files ({proofs.length}/4)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {proofs.map((file, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Small Text: 12px */}
                      <p className="text-xs text-gray-600 truncate leading-normal font-medium">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 leading-normal">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="ml-2 text-red-500 hover:text-red-700 text-sm font-medium transition-colors duration-200"
                      aria-label={`Remove ${file.name}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Offline Warning */}
        {isOffline && (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-orange-500 text-lg">ℹ️</span>
              </div>
              <div className="ml-3">
                {/* Secondary Text: 14px */}
                <p className="text-sm text-orange-700 leading-normal">
                  File uploads are only available when online. You can add evidence files after reconnecting to the internet.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
