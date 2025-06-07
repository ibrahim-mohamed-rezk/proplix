'use client';

import React from 'react';

interface ModalFormProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function ModalForm({ open, title, onClose, children }: ModalFormProps) {
  if (!open) return null;

  return (
    <div className="position-fixed top-0 left-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white w-100 max-w-lg rounded-3 shadow-lg p-4 position-relative animate__animated animate__fadeIn">
        {/* Close button */}
        <button
          className="position-absolute top-0 end-0 p-2 text-muted hover:text-dark border-0 bg-transparent"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="h4 font-weight-bold text-dark mb-4">{title}</h2>

        {/* Form Content */}
        <div className="space-y-3">{children}</div>
      </div>
    </div>
  );
}
