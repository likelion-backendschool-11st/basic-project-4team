import React from 'react';
import type { InsightCard as InsightCardData } from '../../data/market';
import { InsightCard } from './InsightCard';

interface MarketInsightSummaryProps {
  readonly title: string;
  readonly cards: readonly InsightCardData[];
}

/** "어제 시장 인사이트" three-card summary row. */
export const MarketInsightSummary: React.FC<MarketInsightSummaryProps> = ({ title, cards }) => (
  // data-component="MarketInsightSummary"
  <section className="flex flex-col gap-space-sm">
    <h2 className="font-heading-4 text-heading-4 text-on-surface font-bold">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
      {cards.map((card) => (
        <InsightCard insight={card} key={card.id} />
      ))}
    </div>
  </section>
);

export default MarketInsightSummary;
