import React from 'react';
import { Link } from 'react-router-dom';

interface CategoryBannerProps {
  readonly title: string;
  readonly body: string;
  readonly linkLabel: string;
  readonly linkTo: string;
}

/** Micro-banner at the bottom of the category explorer. */
export const CategoryBanner: React.FC<CategoryBannerProps> = ({ title, body, linkLabel, linkTo }) => (
  <div className="mt-5 p-3 rounded bg-mint-50 border border-mint-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
    <div className="flex flex-wrap items-center gap-2 text-xs text-primary-deep">
      <span className="font-bold">{title}</span>
      <span>{body}</span>
    </div>
    <Link className="font-medium text-primary-container hover:underline shrink-0" to={linkTo}>
      {linkLabel}
    </Link>
  </div>
);

export default CategoryBanner;
