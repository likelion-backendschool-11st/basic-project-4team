import React from 'react';
import { Icon } from '../common/Icon';
import type { DescriptionParagraph, InspectionPoint } from '../../data/listing';
import { ExpandableDescription } from './ExpandableDescription';
import { InspectionChecklist } from './InspectionChecklist';

interface SellerDescriptionContent {
  readonly title: string;
  readonly note: string;
  readonly expandLabel: string;
  readonly collapseLabel: string;
}

interface SellerInspectionContent {
  readonly title: string;
  readonly badge: string;
  readonly points: readonly InspectionPoint[];
}

interface SellerDescriptionSectionProps {
  readonly content: SellerDescriptionContent;
  readonly paragraphs: readonly DescriptionParagraph[];
  readonly inspection: SellerInspectionContent;
}

/** 상품 정보 및 상세 설명 panel with inspection checklist (seller view). */
export const SellerDescriptionSection: React.FC<SellerDescriptionSectionProps> = ({ content, paragraphs, inspection }) => (
  /* data-component="ProductDescriptionSection" */
  <section className="bg-canvas-soft rounded p-space-md md:p-space-xl mb-space-xl">
    <div className="flex flex-wrap items-center justify-between gap-space-xs mb-space-md">
      <h2 className="font-heading-3 text-heading-3 text-ink flex items-center gap-2">
        <Icon className="text-primary" name="description" />
        <span>{content.title}</span>
      </h2>
      <span className="font-caption text-caption text-muted">{content.note}</span>
    </div>
    <ExpandableDescription
      collapseLabel={content.collapseLabel}
      expandLabel={content.expandLabel}
      paragraphs={paragraphs}
      variant="seller"
    />
    <InspectionChecklist badge={inspection.badge} points={inspection.points} title={inspection.title} />
  </section>
);

export default SellerDescriptionSection;
