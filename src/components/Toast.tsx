'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

type ToastProps = {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
};

export default function Toast({ message, type = 'info', duration = 3000 }: ToastProps) {
  const t = useTranslations("toast");
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!show) return null;

  // Define Bootstrap background colors based on the type of toast
  const toastClass = {
    success: 'bg-success',
    error: 'bg-danger',
    info: 'bg-info',
  }[type];

  return (
    <div className={`toast show position-fixed top-0 end-0 m-3 text-white ${toastClass}`} role="alert" aria-live="assertive" aria-atomic="true">
      <div className="toast-body">
        {t(message)}
      </div>
    </div>
  );
}
