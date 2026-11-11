import React from 'react';

interface RankingSectionHeaderProps {
  readonly eyebrow: string;
  readonly eyebrowNote: string;
  readonly title: string;
  readonly children?: React.ReactNode;
}

export const RankingSectionHeader: React.FC<RankingSectionHeaderProps> = ({ eyebrow, eyebrowNote, title, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
    <div>
      <div className="flex items-center gap-2">
        <span className="font-eyebrow text-eyebrow text-primary-container uppercase tracking-wider">{eyebrow}</span>
        <span className="text-xs text-faint">{eyebrowNote}</span>
      </div>
      <h2 className="text-xl font-extrabold text-ink">{title}</h2>
    </div>
    {children}
  </div>
);

export default RankingSectionHeader;
