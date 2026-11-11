import React, { useEffect } from 'react';

interface ListingModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly labelledBy: string;
  readonly size?: 'md' | 'lg';
  readonly children: React.ReactNode;
}

/** Backdrop + centered dialog shell used by the seller modals. Closes on Escape / backdrop click. */
export const ListingModal: React.FC<ListingModalProps> = ({ open, onClose, labelledBy, size = 'md', children }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm flex items-center justify-center p-space-md"
      onClick={onClose}
    >
      <div
        aria-labelledby={labelledBy}
        aria-modal="true"
        className={`w-full ${size === 'lg' ? 'max-w-lg' : 'max-w-md'} bg-canvas rounded shadow-xl overflow-hidden p-space-lg sm:p-space-xl flex flex-col`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        {children}
      </div>
    </div>
  );
};

export default ListingModal;
