import React from 'react';
import { Icon } from '../common/Icon';
import type { ListingStatus, StatusOption } from '../../data/listing';

interface StatusDropdownProps {
  readonly prefix: string;
  readonly status: ListingStatus;
  readonly options: readonly StatusOption[];
  readonly open: boolean;
  readonly menuRef: React.RefObject<HTMLDivElement>;
  readonly onToggle: () => void;
  readonly onSelect: (status: ListingStatus) => void;
  readonly onOpenDealModal: () => void;
}

/** "2. 상태: 판매중" dropdown — 판매중 / 예약중 / 거래완료(→ 시세 반영 모달). */
export const StatusDropdown: React.FC<StatusDropdownProps> = ({
  prefix,
  status,
  options,
  open,
  menuRef,
  onToggle,
  onSelect,
  onOpenDealModal,
}) => (
  /* data-component="StatusChangeDropdown" */
  <div ref={menuRef} className="relative w-full">
    <button
      aria-expanded={open}
      aria-haspopup="listbox"
      className="w-full flex items-center justify-between py-space-sm px-space-md bg-primary-container text-on-primary rounded font-ui-label text-ui-label hover:bg-forest transition-colors"
      onClick={onToggle}
      type="button"
    >
      <span className="flex items-center gap-1.5">
        <Icon className="text-[18px]" name="autorenew" />
        <span>
          {prefix}
          {status}
        </span>
      </span>
      <Icon className="text-[18px]" name={open ? 'expand_less' : 'expand_more'} />
    </button>
    {open && (
      <div className="absolute top-full left-0 right-0 mt-1 bg-canvas rounded shadow-xl py-1 z-30" role="listbox">
        {options.map((opt) => (
          <button
            key={opt.status}
            aria-selected={opt.status === status}
            className={`w-full px-space-md py-space-xs flex items-center justify-between text-left hover:bg-mint-50 transition-colors ${
              opt.opensDealModal ? 'bg-canvas-soft' : ''
            }`}
            onClick={() => (opt.opensDealModal ? onOpenDealModal() : onSelect(opt.status))}
            role="option"
            type="button"
          >
            <span className="flex items-center gap-2 font-ui-sm text-ui-sm text-ink">
              <span className={`w-2 h-2 rounded-full ${opt.dotClass}`} />
              <span className={opt.opensDealModal ? 'font-bold' : ''}>{opt.label}</span>
            </span>
            <span
              className={`font-micro text-micro ${opt.opensDealModal ? 'text-primary-container font-bold' : 'text-muted'}`}
            >
              {opt.hint}
            </span>
          </button>
        ))}
      </div>
    )}
  </div>
);

export default StatusDropdown;
