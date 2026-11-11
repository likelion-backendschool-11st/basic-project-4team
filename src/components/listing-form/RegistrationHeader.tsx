import React from 'react';
import { Icon } from '../common/Icon';
import { createHeaderCopy } from '../../data/listingForm';

interface RegistrationHeaderProps {
  readonly className?: string;
}

/** Create-mode forest banner (P-014 code, title, feature chips). */
export const RegistrationHeader: React.FC<RegistrationHeaderProps> = ({ className = '' }) => {
  const c = createHeaderCopy;
  return (
    // data-component="RegistrationHeader"
    <div className={`w-full bg-forest text-on-primary py-space-md ${className}`}>
      <div className="max-w-7xl mx-auto px-gutter-desktop flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm">
          <span className="bg-lime-ribbon text-forest font-eyebrow text-eyebrow px-2 py-0.5 rounded">{c.code}</span>
          <h1 className="font-heading-2 text-heading-2 text-on-primary tracking-tight">{c.title}</h1>
          <span className="text-mint-200 font-body-sm text-body-sm hidden sm:inline">{c.subtitle}</span>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm text-mint-100 font-caption text-caption">
          {c.features.map((f, i) => (
            <React.Fragment key={f.label}>
              {i > 0 && <span>·</span>}
              <span className="flex items-center gap-1">
                <Icon className="text-[16px] text-lime-accent" name={f.icon} />
                {f.label}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegistrationHeader;
