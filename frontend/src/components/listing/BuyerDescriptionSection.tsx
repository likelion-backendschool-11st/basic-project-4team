import React from 'react';
import type { DescriptionParagraph } from '../../data/listing';
import { ExpandableDescription } from './ExpandableDescription';
import { ListingInfoCallout } from './ListingInfoCallout';

interface BuyerDescriptionContent {
  readonly title: string;
  readonly updatedAt: string;
  /** 실물 인증 사진이 있을 때만. 없으면 null → 안내를 숨긴다. */
  readonly possession: { readonly title: string; readonly body: string } | null;
  readonly expandLabel: string;
  readonly collapseLabel: string;
  readonly escrowNotice: string;
}

interface BuyerDescriptionSectionProps {
  readonly content: BuyerDescriptionContent;
  readonly paragraphs: readonly DescriptionParagraph[];
}

/** 상품 정보 column: header, 실물 인증 callout, expandable body, escrow notice. */
export const BuyerDescriptionSection: React.FC<BuyerDescriptionSectionProps> = ({ content, paragraphs }) => (
  /* data-component="ProductDescription" */
  <section className="lg:col-span-7 flex flex-col">
    <div className="flex flex-wrap items-center justify-between gap-space-xs pb-space-xs border-b border-hairline">
      <h2 className="font-heading-3 text-heading-3 text-ink">{content.title}</h2>
      <span className="text-muted font-caption text-caption">{content.updatedAt}</span>
    </div>
    {content.possession ? (
      <ListingInfoCallout body={content.possession.body} icon="approval" title={content.possession.title} variant="possession" />
    ) : null}
    <ExpandableDescription
      collapseLabel={content.collapseLabel}
      expandLabel={content.expandLabel}
      paragraphs={paragraphs}
      variant="buyer"
    />
    <ListingInfoCallout body={content.escrowNotice} icon="security" variant="escrow" />
  </section>
);

export default BuyerDescriptionSection;
