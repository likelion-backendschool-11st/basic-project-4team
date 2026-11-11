import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { editHeaderCopy } from '../../data/listingForm';

interface EditHeaderBannerProps {
  readonly registrationNo: string;
}

/** Edit-only breadcrumb + listing status strip. */
export const EditHeaderBanner: React.FC<EditHeaderBannerProps> = ({ registrationNo }) => {
  const c = editHeaderCopy;
  return (
    // data-component="EditHeaderBanner"
    <section className="w-full bg-canvas-soft border-b border-hairline py-space-sm">
      <div className="max-w-7xl mx-auto px-gutter-desktop flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
        <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-space-xs text-muted font-caption text-caption">
          {c.breadcrumb.map((b) => (
            <React.Fragment key={b.label}>
              <Link className="hover:text-ink transition-colors" to={b.to}>
                {b.label}
              </Link>
              <span className="text-faint">/</span>
            </React.Fragment>
          ))}
          <span className="text-ink font-bold">{c.current}</span>
        </nav>
        <div className="flex flex-wrap items-center gap-space-xs">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-mint-100 text-forest font-micro text-micro font-bold">
            <Icon className="text-[13px]" name="verified" />
            {c.statusBadge}
          </span>
          <span className="text-muted font-micro text-micro">{`${c.regPrefix}${registrationNo}`}</span>
        </div>
      </div>
    </section>
  );
};

export default EditHeaderBanner;
