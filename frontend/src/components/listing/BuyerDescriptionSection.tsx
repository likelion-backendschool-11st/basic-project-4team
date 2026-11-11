import React from 'react';
import type { DescriptionParagraph } from '../../data/listing';
import { ExpandableDescription } from './ExpandableDescription';
import { ListingInfoCallout } from './ListingInfoCallout';

interface BuyerDescriptionContent {
  readonly title: string;
  readonly badge: string;
  readonly updatedAt: string;
  readonly possessionTitle: string;
  readonly possessionBody: string;
  readonly expandLabel: string;
  readonly collapseLabel: string;
  readonly escrowNotice: string;
  readonly escrowLinkLabel: string;
  readonly escrowLinkTo: string;
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
      <div className="flex items-center gap-2">
        <h2 className="font-heading-3 text-heading-3 text-ink">{content.title}</h2>
        <span className="bg-mint-100 text-forest font-eyebrow text-eyebrow px-2 py-0.5 rounded">{content.badge}</span>
      </div>
      <span className="text-muted font-caption text-caption">{content.updatedAt}</span>
    </div>
    <ListingInfoCallout body={content.possessionBody} icon="approval" title={content.possessionTitle} variant="possession" />
    <ExpandableDescription
      collapseLabel={content.collapseLabel}
      expandLabel={content.expandLabel}
      paragraphs={paragraphs}
      variant="buyer"
    />
    <ListingInfoCallout
      body={content.escrowNotice}
      icon="security"
      linkLabel={content.escrowLinkLabel}
      linkTo={content.escrowLinkTo}
      variant="escrow"
    />
  </section>
);

export default BuyerDescriptionSection;
