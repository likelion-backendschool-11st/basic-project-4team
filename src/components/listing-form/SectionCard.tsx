import React from 'react';
import type { FormVariant } from '../../data/listingForm';

interface SectionCardProps {
  readonly variant: FormVariant;
  readonly step: number | string;
  readonly title: string;
  /** Text right next to the title (create: muted caption; edit: count etc.). */
  readonly inlineHint?: React.ReactNode;
  /** Right-aligned header slot. */
  readonly right?: React.ReactNode;
  readonly children: React.ReactNode;
  readonly className?: string;
}

/** Numbered form section card. Create = shadowed card, edit = hairline-bordered card. */
export const SectionCard: React.FC<SectionCardProps> = ({ variant, step, title, inlineHint, right, children, className = '' }) => {
  const isCreate = variant === 'create';
  return (
    <div
      className={`${
        isCreate ? 'bg-canvas p-space-lg rounded shadow-sm' : 'bg-canvas border border-hairline rounded p-space-lg'
      } flex flex-col gap-space-md ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
        <div className={`flex items-center flex-wrap ${isCreate ? 'gap-2' : 'gap-space-xs'}`}>
          {isCreate ? (
            <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary font-ui-label text-ui-label flex items-center justify-center shrink-0">
              {step}
            </span>
          ) : (
            <span className="w-5 h-5 rounded-full bg-forest text-on-primary font-micro text-micro flex items-center justify-center font-bold shrink-0">
              {step}
            </span>
          )}
          <h2 className="font-ui-label text-ui-label text-ink">{title}</h2>
          {inlineHint}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
};

export default SectionCard;
