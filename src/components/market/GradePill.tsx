import React from 'react';

export type GradePillSize = 'md' | 'sm';

interface GradePillProps {
  readonly label: string;
  readonly count?: number;
  readonly active: boolean;
  readonly size?: GradePillSize;
  readonly onClick: () => void;
}

/** Rounded filter pill with a trailing count badge (grade / sub-option filters). */
export const GradePill: React.FC<GradePillProps> = ({ label, count, active, size = 'md', onClick }) => {
  const sizing =
    size === 'md' ? 'px-space-md py-1.5 font-ui-sm text-ui-sm gap-1.5' : 'px-space-sm py-1 font-caption text-caption gap-1';
  const countSize = size === 'md' ? 'text-[11px]' : 'text-[10px]';
  const state = active
    ? `bg-forest text-on-primary font-bold ${size === 'md' ? 'shadow-sm' : ''}`
    : 'bg-canvas border border-hairline-strong/70 text-on-surface hover:bg-surface-container transition-colors';

  return (
    <button aria-pressed={active} className={`rounded-full flex items-center shrink-0 ${sizing} ${state}`} onClick={onClick} type="button">
      <span>{label}</span>
      {count !== undefined ? (
        <span className={`${countSize} ${active ? 'font-normal opacity-80' : 'text-muted'}`}>{count}</span>
      ) : null}
    </button>
  );
};

export default GradePill;
