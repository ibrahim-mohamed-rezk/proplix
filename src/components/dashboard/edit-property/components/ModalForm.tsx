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
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75 backdrop-blur-sm"
      style={{ zIndex: 1050 }}
      onClick={onClose}
    >
      <div 
        className="bg-white w-100 position-relative shadow-lg animate__animated animate__fadeInUp"
        style={{ 
          maxWidth: '500px',
          borderRadius: '16px',
          animation: 'modalSlideUp 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with orange gradient */}
        <div 
          className="position-relative p-4 "
          style={{
            // background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
            borderRadius: '16px 16px 0 0'
          }}
        >
<h2 className="h4 font-weight-bold mb-0 pe-5">
  {title}
</h2>
          
          {/* Enhanced close button */}
          <button
            className="position-absolute border-0 bg-transparent  d-flex align-items-center justify-content-center"
            style={{
              top: '12px',
              right: '12px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              transition: 'all 0.2s ease',
              fontSize: '18px'
            }}
            onClick={onClose}
            aria-label="Close modal"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            }}
          >
            ×
          </button>
        </div>

        {/* Content area */}
        <div className="p-4">
          <div style={{ marginBottom: '1rem' }}>{children}</div>
        </div>

        {/* Bottom orange accent line */}
        <div 
          style={{
            height: '4px',
            background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
            borderRadius: '0 0 16px 16px',
            opacity: 0.3
          }}
        ></div>
      </div>

      <style jsx>{`
        @keyframes modalSlideUp {
          from { 
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
}