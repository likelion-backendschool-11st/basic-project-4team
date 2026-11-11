import React from 'react';
import { MarketCategoryHeader } from '../components/market/MarketCategoryHeader';
import { MarketInsightSummary } from '../components/market/MarketInsightSummary';
import { PriceCardSection } from '../components/market/PriceCardSection';
import { TopGainersWidget } from '../components/market/TopGainersWidget';
import { TrendChartPanel } from '../components/market/TrendChartPanel';
import {
  categoryTabs,
  chartSection,
  gradeFilters,
  insightSection,
  marketHeader,
  marketLinks,
  priceGridSection,
  topGainersSection,
} from '../data/market';
import { useChartMode } from '../hooks/market/useChartMode';
import { useSelection } from '../hooks/market/useSelection';

interface MarketDashboardPageProps {
  readonly className?: string;
}

/** P-017 market price dashboard (`/market`). */
export const MarketDashboardPage: React.FC<MarketDashboardPageProps> = ({ className = '' }) => {
  const category = useSelection<string>(categoryTabs[0].id);
  const grade = useSelection<string>(gradeFilters[0].id);
  const chart = useChartMode('line');

  return (
    <div className={`w-full bg-canvas-soft pb-space-xxl ${className}`}>
      <div className="w-full max-w-[1240px] mx-auto px-gutter pt-space-lg flex flex-col gap-space-xl">
        <MarketCategoryHeader
          activeGradeId={grade.selected}
          activeTabId={category.selected}
          badge={marketHeader.badge}
          chips={marketHeader.chips}
          gradeLabel={marketHeader.gradeLabel}
          grades={gradeFilters}
          noticePrefix={marketHeader.noticePrefix}
          noticeStrong={marketHeader.noticeStrong}
          noticeSuffix={marketHeader.noticeSuffix}
          onGradeChange={grade.select}
          onTabChange={category.select}
          syncLabel={marketHeader.syncLabel}
          tabs={categoryTabs}
          title={marketHeader.title}
        />

        <MarketInsightSummary cards={insightSection.cards} title={insightSection.title} />

        {/* data-component="TrendChartSection" */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop">
          <TrendChartPanel
            legend={chartSection.legend}
            mode={chart.mode}
            modes={chartSection.modes}
            onModeChange={chart.setMode}
            points={chartSection.points}
            priceDomain={chartSection.priceDomain}
            priceTicks={chartSection.priceTicks}
            stats={chartSection.stats}
            title={chartSection.title}
            volumeMax={chartSection.volumeMax}
            volumeTicks={chartSection.volumeTicks}
            xLabels={chartSection.xLabels}
          />
          <TopGainersWidget
            caption={topGainersSection.caption}
            currency={priceGridSection.currency}
            items={topGainersSection.items}
            linkFor={marketLinks.item}
            title={topGainersSection.title}
            volumePrefix={topGainersSection.volumePrefix}
            volumeSuffix={topGainersSection.volumeSuffix}
          />
        </section>

        <PriceCardSection />
      </div>
    </div>
  );
};

export default MarketDashboardPage;
