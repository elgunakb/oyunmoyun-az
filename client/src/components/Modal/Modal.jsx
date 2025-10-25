import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

export default function Modal({ open, onClose, titleId, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    // ESC
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    const prev = document.activeElement;
    // dialogRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = prevOverflow;
      prev && prev.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      aria-labelledby={titleId}
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="
          w-full max-w-lg sm:max-w-xl md:max-w-2xl  bg-[#0c161e] 
          rounded-2xl border border-white/10 
          bg-linear-to-b text-white shadow-2xl outline-none
          grid grid-rows-[auto_1fr_auto]
          max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)]
        "
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  titleId: PropTypes.string,
  children: PropTypes.node,
};
