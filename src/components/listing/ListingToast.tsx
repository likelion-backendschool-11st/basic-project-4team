import React from 'react';
import { Icon } from '../common/Icon';
import type { ToastState } from '../../hooks/listing/useToast';

interface ListingToastProps {
  readonly toast: ToastState;
  /** center: bottom-center (buyer) · right: bottom-right (seller). */
  readonly position?: 'center' | 'right';
}

/** Action feedback toast (copy URL, wishlist, status change …). */
export const ListingToast: React.FC<ListingToastProps> = ({ toast, position = 'center' }) => {
  const pos = position === 'right' ? 'bottom-6 right-6 left-6 sm:left-auto' : 'bottom-6 left-1/2 -translate-x-1/2';
  return (
    <div
      aria-live="polite"
      className={`fixed ${pos} bg-forest text-on-primary font-ui-sm text-ui-sm px-4 py-2 rounded shadow-lg z-50 transition-all duration-300 flex items-center gap-1.5 ${
        toast.visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      role="status"
    >
      <Icon className="text-lime-ribbon text-[18px]" name={toast.icon} />
      <span>{toast.message}</span>
    </div>
  );
};

export default ListingToast;
