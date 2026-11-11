import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';

interface EscrowGuideBannerProps {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly linkLabel: string;
  readonly linkTo: string;
}

/** Bottom escrow / grading guarantee strip. */
export const EscrowGuideBanner: React.FC<EscrowGuideBannerProps> = ({ icon, title, description, linkLabel, linkTo }) => (
  <section className="mt-space-xl p-space-md bg-canvas-soft rounded flex flex-col md:flex-row items-center justify-between gap-space-md">
    <div className="flex items-center gap-space-sm">
      <div className="w-10 h-10 shrink-0 rounded-full bg-mint-100 flex items-center justify-center text-primary-container">
        <Icon className="text-[24px]" name={icon} />
      </div>
      <div>
        <h3 className="font-ui-label text-ui-label text-ink">{title}</h3>
        <p className="font-body-sm text-body-sm text-muted">{description}</p>
      </div>
    </div>
    <div className="flex items-center gap-space-xs shrink-0">
      {/* data-path="escrow-inspection" */}
      <Link
        className="font-ui-label text-ui-label text-primary-container hover:text-forest flex items-center gap-1 underline underline-offset-4"
        to={linkTo}
      >
        <span>{linkLabel}</span>
        <Icon className="text-[16px]" name="arrow_forward" />
      </Link>
    </div>
  </section>
);

export default EscrowGuideBanner;
