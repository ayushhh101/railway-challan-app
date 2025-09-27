import React from 'react';
import SignatureCanvas from 'react-signature-canvas';

export default function DigitalSignature({ sigCanvasRef }) {
  const clearSignature = () => {
    sigCanvasRef.current.clear();
  };

  return (
    <div>
      <h2 className="text-xl lg:text-2xl font-semibold text-blue-800 mb-6 pb-3 border-b-2 border-blue-100 leading-tight">
        Digital Signature
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 leading-normal">
            TTE Signature *
          </label>
          <p className="text-sm text-gray-600 mb-4 leading-normal">
            Please provide your digital signature in the box below
          </p>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
          <SignatureCanvas
            penColor="black"
            ref={sigCanvasRef}
            canvasProps={{
              width: 600,
              height: 200,
              className: 'bg-white rounded-lg border border-gray-200 w-full max-w-full cursor-crosshair',
            }}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">

          <button
            type="button"
            onClick={clearSignature}
            className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors duration-200 leading-normal self-start"
            aria-label="Clear Signature"
          >
            Clear Signature
          </button>
          
          <p className="text-xs text-gray-500 leading-normal">
            Draw your signature using mouse/finger
          </p>
        </div>
      </div>
    </div>
  );
}
