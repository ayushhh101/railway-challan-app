import React from 'react';

export default function AttachProof({ proofs, setProofs, isOffline }) {
  const handleFilesChange = (e) => {
    setProofs(Array.from(e.target.files));
  };

  return (
    <div>
      <label className="text-neutral-gray900 text-sm font-semibold mb-2 border-b border-neutral-gray200 pb-1">
        Attach Proof (Photo/PDF, optional, up to 4)
      </label>
      <input
        type="file"
        accept="image/*,application/pdf"
        capture="environment"
        multiple
        disabled={isOffline}
        onChange={handleFilesChange}
        className="block w-full text-sm text-neutral-gray700 bg-neutral-gray50 border border-neutral-gray300 rounded-2xl p-2 file:py-2 file:px-4 file:rounded-2xl file:border-0 file:text-sm file:text-neutral-gray900 disabled:opacity-60"
      />
      <div className="flex flex-wrap gap-2 mt-2">
        {proofs.map((file, idx) => (
          <span key={idx} className="text-xs px-2 py-1 bg-slate-100 rounded">
            {file.name}
          </span>
        ))}
      </div>
      {isOffline && (
        <p className="text-xs text-accent-orange mt-1">
          Proof/photo uploads available only when online.
        </p>
      )}
    </div>
  );
}
