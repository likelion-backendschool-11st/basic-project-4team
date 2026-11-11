import React from 'react';
import { CategoryExplorerPanel } from '../components/home/CategoryExplorerPanel';
import { MarketplaceHero } from '../components/home/MarketplaceHero';
import { MarketRankingSection } from '../components/home/MarketRankingSection';
import { heroData, rankingProducts } from '../data/home';
import { useCategoryPanel } from '../hooks/home/useCategoryPanel';
import { useRankingFilter } from '../hooks/home/useRankingFilter';

interface HomePageProps {
  readonly className?: string;
}

/** P-001 메인 — rendered inside AppLayout (GNB + footer come from the layout). */
export const HomePage: React.FC<HomePageProps> = ({ className = '' }) => {
  const categoryPanel = useCategoryPanel();
  const ranking = useRankingFilter(rankingProducts);

  return (
    <div className={`bg-canvas-soft min-h-full ${className}`}>
      <CategoryExplorerPanel onToggle={categoryPanel.toggle} open={categoryPanel.open} />
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <MarketplaceHero
          badgeParts={heroData.badgeParts}
          description={heroData.description}
          logoAlt={heroData.logoAlt}
          logoSrc={heroData.logoSrc}
          slogan={heroData.slogan}
          trustChips={heroData.trustChips}
        />
        <MarketRankingSection
          activeFilter={ranking.active}
          onFilterChange={ranking.setActive}
          products={ranking.visible}
        />
      </div>
    </div>
  );
};

export default HomePage;
