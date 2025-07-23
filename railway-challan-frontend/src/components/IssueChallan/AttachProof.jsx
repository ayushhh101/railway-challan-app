import React from 'react';

export default function AttachProof({ proofs, setProofs, isOffline }) {
  const handleFilesChange = (e) => {
    setProofs(Array.from(e.target.files));
  };

  return (
    <div>
      <label className="text-sm font-medium">
        Attach Proof (Photo/PDF, optional, up to 4)
      </label>
      <input
        type="file"
        accept="image/*,application/pdf"
        capture="environment"
        multiple
        disabled={isOffline}
        onChange={handleFilesChange}
        className="block mt-1"
      />
      <div className="flex flex-wrap gap-2 mt-2">
        {proofs.map((file, idx) => (
          <span key={idx} className="text-xs px-2 py-1 bg-slate-100 rounded">
            {file.name}
          </span>
        ))}
      </div>
      {isOffline && (
        <p className="text-xs text-orange-600 mt-1">
          Proof/photo uploads available only when online.
        </p>
      )}
    </div>
  );
}
