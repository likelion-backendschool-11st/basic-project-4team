import React from 'react';
import { MarketCategoryHeader } from '../components/market/MarketCategoryHeader';
import { MarketInsightSummary } from '../components/market/MarketInsightSummary';
import { PriceCardSection } from '../components/market/PriceCardSection';
import { TopGainersWidget } from '../components/market/TopGainersWidget';
import { TrendChartPanel } from '../components/market/TrendChartPanel';
import { chartSection, insightSection, marketHeader, marketLinks, priceGridSection, topGainersSection } from '../data/market';
import { useChartMode } from '../hooks/market/useChartMode';
import { useMarketDashboard } from '../hooks/market/useMarketDashboard';
import { toChartView, toHeaderView, toHeadlineStats, toInsightCards, toTopGainers } from '../hooks/market/marketView';

interface MarketDashboardPageProps {
  readonly className?: string;
}

/** 시세 대시보드 (`/market`) — 거래완료 체결가로 산출한 품목 시세 (#48, MARKET-01~05). */
export const MarketDashboardPage: React.FC<MarketDashboardPageProps> = ({ className = '' }) => {
  const market = useMarketDashboard();
  const chart = useChartMode('line');
  const header = market.filters ? toHeaderView(market.filters, market.grade) : null;
  const overview = market.overview;
  const chartView = React.useMemo(() => (overview ? toChartView(overview.chart) : null), [overview]);
  const notice =
    market.status === 'error'
      ? marketHeader.error
      : market.filters && !market.filters.category
        ? marketHeader.empty
        : !overview
          ? marketHeader.loading
          : null;

  return (
    <div className={`w-full bg-canvas-soft pb-space-xxl ${className}`}>
      <div className="w-full max-w-[1240px] mx-auto px-gutter pt-space-lg flex flex-col gap-space-xl">
        {header ? (
          <MarketCategoryHeader
            activeGradeId={market.grade}
            activeTabId={market.category}
            badge={marketHeader.badge}
            chips={header.chips}
            gradeLabel={marketHeader.gradeLabel}
            grades={header.grades}
            noticePrefix={marketHeader.noticePrefix}
            noticeStrong={header.noticeStrong}
            noticeSuffix={marketHeader.noticeSuffix}
            onGradeChange={market.selectGrade}
            onTabChange={market.selectCategory}
            syncLabel={marketHeader.syncLabel}
            tabs={header.tabs}
            title={header.title}
          />
        ) : null}

        {notice ? <p className="py-space-md text-center font-body-sm text-body-sm text-muted">{notice}</p> : null}

        {overview && chartView ? (
          <>
            <MarketInsightSummary cards={toInsightCards(overview.insights)} title={insightSection.title} />

            {/* data-component="TrendChartSection" */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop">
              <TrendChartPanel
                legend={chartSection.legend}
                mode={chart.mode}
                modes={chartSection.modes}
                onModeChange={chart.setMode}
                points={chartView.points}
                priceDomain={chartView.priceDomain}
                priceTicks={chartView.priceTicks}
                stats={toHeadlineStats(overview.chart)}
                title={chartSection.title}
                volumeMax={chartView.volumeMax}
                volumeTicks={chartView.volumeTicks}
                xLabels={chartView.xLabels}
              />
              <TopGainersWidget
                caption={topGainersSection.caption}
                currency={priceGridSection.currency}
                emptyLabel={topGainersSection.empty}
                items={toTopGainers(overview.topGainers)}
                linkFor={marketLinks.item}
                title={topGainersSection.title}
                volumePrefix={topGainersSection.volumePrefix}
                volumeSuffix={topGainersSection.volumeSuffix}
              />
            </section>
          </>
        ) : null}

        {market.category ? <PriceCardSection category={market.category} grade={market.grade} /> : null}
      </div>
    </div>
  );
};

export default MarketDashboardPage;
