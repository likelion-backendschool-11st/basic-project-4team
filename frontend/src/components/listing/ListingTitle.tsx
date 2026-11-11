import React from 'react';

interface ListingTitleProps {
  readonly title: string;
  readonly className?: string;
}

/** Product title (h1) shared by buyer and seller views. */
export const ListingTitle: React.FC<ListingTitleProps> = ({ title, className = '' }) => (
  <h1 className={`font-heading-2 text-heading-2 text-ink tracking-tight ${className}`}>{title}</h1>
);

export default ListingTitle;
