import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';

interface ListingInfoCalloutProps {
  readonly icon: string;
  readonly title?: string;
  readonly body: string;
  /** possession: grey box with title · escrow: mint strip with trailing link. */
  readonly variant: 'possession' | 'escrow';
  readonly linkLabel?: string;
  readonly linkTo?: string;
}

/** Trust callouts in the buyer description column. */
export const ListingInfoCallout: React.FC<ListingInfoCalloutProps> = ({ icon, title, body, variant, linkLabel, linkTo }) => {
  if (variant === 'escrow') {
    return (
      <div className="mt-space-md border border-hairline rounded p-space-sm bg-mint-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
        <div className="flex items-center gap-space-xs">
          <Icon className="text-primary text-[20px] shrink-0" name={icon} />
          <span className="font-caption text-caption text-forest">{body}</span>
        </div>
        {linkLabel && linkTo && (
          <Link className="font-ui-sm text-ui-sm text-link hover:underline shrink-0 self-end sm:self-auto" to={linkTo}>
            {linkLabel}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="mt-space-sm p-space-sm bg-canvas-soft border border-hairline rounded flex items-start gap-space-sm">
      <Icon className="text-primary-container text-[24px] shrink-0 mt-0.5" name={icon} />
      <div>
        {title && <span className="font-ui-label text-ui-label text-ink">{title}</span>}
        <p className="font-caption text-caption text-muted mt-0.5">{body}</p>
      </div>
    </div>
  );
};

export default ListingInfoCallout;
