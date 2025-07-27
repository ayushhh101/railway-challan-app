import React, { useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export default function DigitalSignature({ sigCanvasRef }) {
  const clearSignature = () => {
    sigCanvasRef.current.clear();
  };

  return (
    <div>
      <div className='pb-0.5'>
      <label className="text-sm font-medium">Digital Signature</label>
      </div>
      <div className="border rounded-md p-2 bg-gray-50">
        <SignatureCanvas
          penColor="black"
          ref={sigCanvasRef}
          canvasProps={{
            width: 450,
            height: 150,
            className: 'bg-white rounded border w-full',
          }}
        />
      </div>
      <button
        type="button"
        onClick={clearSignature}
        className="text-sm text-red-600 mt-2"
      >
        Clear Signature
      </button>
    </div>
  );
}
