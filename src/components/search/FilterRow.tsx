import React from 'react';
import { Icon } from '../common/Icon';

export type FilterRowVariant = 'default' | 'active' | 'disabled';

interface FilterRowProps {
  readonly label: string;
  readonly icon: string;
  readonly variant?: FilterRowVariant;
  readonly badge?: string;
  readonly hoverable?: boolean;
  readonly contentClassName?: string;
  readonly children: React.ReactNode;
}

const rowStyles: Record<FilterRowVariant, string> = {
  default: 'bg-canvas',
  active: 'bg-mint-50/40',
  disabled: 'bg-canvas-soft/60',
};

const labelStyles: Record<FilterRowVariant, string> = {
  default: 'bg-surface-container-low text-body',
  active: 'bg-mint-100 text-forest justify-between',
  disabled: 'bg-surface-container text-muted justify-between',
};

const badgeStyles: Record<FilterRowVariant, string> = {
  default: '',
  active: 'bg-primary text-on-primary font-micro text-micro px-1 py-px rounded',
  disabled: 'font-micro text-micro text-muted',
};

/** One row of the structural filter panel: label column (2/12) + options column (10/12). */
export const FilterRow: React.FC<FilterRowProps> = ({
  label,
  icon,
  variant = 'default',
  badge,
  hoverable = false,
  contentClassName = 'gap-space-xs',
  children,
}) => (
  <div
    className={`grid grid-cols-12 items-center ${rowStyles[variant]} ${hoverable ? 'hover:bg-canvas-soft transition-colors' : ''}`}
  >
    <div
      className={`col-span-12 md:col-span-2 px-space-md py-space-sm font-ui-label text-ui-label flex items-center gap-1.5 self-stretch ${labelStyles[variant]}`}
    >
      <div className="flex items-center gap-1.5">
        <Icon className={`text-[16px] ${variant === 'active' ? 'text-primary' : 'text-muted'}`} name={icon} />
        <span>{label}</span>
      </div>
      {badge ? <span className={badgeStyles[variant]}>{badge}</span> : null}
    </div>
    <div
      className={`col-span-12 md:col-span-10 px-space-md py-space-sm flex flex-wrap items-center ${contentClassName} ${variant === 'disabled' ? 'opacity-60' : ''}`}
    >
      {children}
    </div>
  </div>
);

export default FilterRow;
