import React from 'react';
import type { SpecItem } from '../../data/listing';

interface ListingSpecSummaryProps {
  readonly title: string;
  readonly specs: readonly SpecItem[];
}

const valueTone: Record<NonNullable<SpecItem['tone']>, string> = {
  default: 'text-ink',
  primary: 'text-primary',
  grade: 'text-forest bg-lime-panel rounded py-0.5',
};

/** 카테고리별 필수 스펙 요약 — compact tabular spec strip. */
export const ListingSpecSummary: React.FC<ListingSpecSummaryProps> = ({ title, specs }) => (
  /* data-component="ProductSpecTable" */
  <div className="mt-space-sm">
    <h4 className="font-eyebrow text-eyebrow text-muted uppercase tracking-wider mb-space-xs">{title}</h4>
    <div className="bg-canvas-soft border border-hairline rounded p-space-sm grid grid-cols-3 md:grid-cols-5 gap-space-xs text-center font-caption text-caption">
      {specs.map((spec, i) => (
        <div key={spec.label} className={i < specs.length - 1 ? 'md:border-r md:border-hairline md:pr-space-xs' : ''}>
          <span className="text-muted block font-micro text-micro">{spec.label}</span>
          <strong className={`font-ui-label text-ui-label mt-0.5 block ${valueTone[spec.tone ?? 'default']}`}>{spec.value}</strong>
        </div>
      ))}
    </div>
  </div>
);

export default ListingSpecSummary;
