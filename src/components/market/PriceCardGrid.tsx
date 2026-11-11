import React from 'react';
import type { PriceCard, ViewMode } from '../../data/market';
import { type PriceCardLabels, PriceCardItem } from './PriceCardItem';

interface PriceCardGridProps {
  readonly cards: readonly PriceCard[];
  readonly viewMode: ViewMode;
  readonly linkFor: (id: string) => string;
  readonly labels: PriceCardLabels;
  readonly emptyLabel: string;
}

/** 3-column (desktop) grid — or single-column list — of price cards. */
export const PriceCardGrid: React.FC<PriceCardGridProps> = ({ cards, viewMode, linkFor, labels, emptyLabel }) => {
  if (cards.length === 0) {
    return <p className="py-space-xl text-center font-body-sm text-body-sm text-muted">{emptyLabel}</p>;
  }

  return (
    <div
      className={`grid gap-gutter-desktop mt-space-sm ${
        viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
      }`}
    >
      {cards.map((card) => (
        <PriceCardItem card={card} key={card.id} labels={labels} layout={viewMode} to={linkFor(card.id)} />
      ))}
    </div>
  );
};

export default PriceCardGrid;
