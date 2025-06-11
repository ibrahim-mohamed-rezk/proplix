import React from 'react';

export const TabButton = ({ label, isActive, onClick }: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  className?: string; // Allow className to be passed as an optional prop
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`dash-btn-two mx-1 ${isActive ? "active" : ""}`}
  >
    {label}
  </button>
);

export const ReadOnlyField = ({ label, value }: { 
  label: string; 
  value: string | number 
}) => (
  <div>
    <label className="form-label mb-1 font-weight-medium text-dark">
      {label}
    </label>
    <div className="w-100 px-3 py-2 border rounded bg-light border-muted text-dark min-h-40 d-flex align-items-center">
      {value || "No data"}
    </div>
  </div>
);

export const LoadingSpinner = () => (
  <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
    <div className="text-center">
      <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status"></div>
      <p className="text-muted">Loading property details...</p>
    </div>
  </div>
);

export const NotFoundMessage = () => (
  <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
    <div className="text-center">
      <div className="text-4xl mb-4">🏠</div>
      <h2 className="h4 font-weight-semibold text-dark mb-2">
        Property Not Found
      </h2>
      <p className="text-muted">
        The requested property could not be loaded.
      </p>
    </div>
  </div>
);
