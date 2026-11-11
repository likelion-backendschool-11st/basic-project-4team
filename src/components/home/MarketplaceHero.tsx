import React from 'react';
import { TrustChip } from './TrustChip';

interface MarketplaceHeroProps {
  readonly logoSrc: string;
  readonly logoAlt: string;
  readonly badgeParts: readonly string[];
  readonly slogan: string;
  readonly description: string;
  readonly trustChips: readonly string[];
}

/* data-component="MarketplaceHero" data-purpose="editorial-hero" */
export const MarketplaceHero: React.FC<MarketplaceHeroProps> = ({
  logoSrc,
  logoAlt,
  badgeParts,
  slogan,
  description,
  trustChips,
}) => (
  <section className="relative overflow-hidden bg-primary-deep text-on-primary rounded p-6 sm:p-10 border border-primary-deep shadow-sm">
    <div className="relative z-10 max-w-3xl space-y-4">
      <div className="inline-flex flex-wrap items-center gap-2 px-2.5 py-1 rounded bg-secondary-fixed-dim/20 border border-secondary-fixed-dim text-secondary-fixed-dim text-xs font-bold uppercase tracking-wider">
        {badgeParts.map((part) => (
          <span key={part}>{part}</span>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <img alt={logoAlt} className="h-8 sm:h-9 w-auto object-contain" src={logoSrc} />
        <div className="h-4 w-px bg-on-primary/30 hidden sm:block" />
        <span className="text-xs sm:text-sm font-semibold tracking-wide text-lime-panel">{slogan}</span>
      </div>
      <p className="text-sm sm:text-base text-surface-variant font-normal leading-relaxed max-w-2xl">{description}</p>
      <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-on-primary/90">
        {trustChips.map((chip) => (
          <TrustChip key={chip} label={chip} />
        ))}
      </div>
    </div>
    <div className="absolute -right-10 -bottom-10 w-80 h-80 rounded-[9999px] bg-primary-container/30 blur-3xl pointer-events-none" />
  </section>
);

export default MarketplaceHero;
