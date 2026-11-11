import React from 'react';
import type { RankingFilterId, RankingProduct } from '../../data/home';
import { rankingSection } from '../../data/home';
import { FilterChips } from './FilterChips';
import { ProductCard } from './ProductCard';
import { RankingSectionHeader } from './RankingSectionHeader';

interface MarketRankingSectionProps {
  readonly products: readonly RankingProduct[];
  readonly activeFilter: RankingFilterId;
  readonly onFilterChange: (id: RankingFilterId) => void;
}

/* data-purpose="market-ranking-preview" */
export const MarketRankingSection: React.FC<MarketRankingSectionProps> = ({ products, activeFilter, onFilterChange }) => (
  <section className="space-y-4">
    <RankingSectionHeader eyebrow={rankingSection.eyebrow} eyebrowNote={rankingSection.eyebrowNote} title={rankingSection.title}>
      <FilterChips active={activeFilter} filters={rankingSection.filters} onSelect={onFilterChange} />
    </RankingSectionHeader>
    {/* data-component="ProductGrid" */}
    {products.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard buyLabel={rankingSection.buyLabel} key={product.id} product={product} sellLabel={rankingSection.sellLabel} />
        ))}
      </div>
    ) : (
      <p className="py-space-section text-center text-sm text-muted">{rankingSection.emptyLabel}</p>
    )}
  </section>
);

export default MarketRankingSection;
