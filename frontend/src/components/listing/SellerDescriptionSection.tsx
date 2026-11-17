import React from 'react';
import { Icon } from '../common/Icon';
import type { DescriptionParagraph } from '../../data/listing';
import { ExpandableDescription } from './ExpandableDescription';

interface SellerDescriptionContent {
  readonly title: string;
  readonly expandLabel: string;
  readonly collapseLabel: string;
}

interface SellerDescriptionSectionProps {
  readonly content: SellerDescriptionContent;
  readonly paragraphs: readonly DescriptionParagraph[];
}

/** 상품 정보 및 상세 설명 panel (seller view). 본문은 판매글 description(DB). */
export const SellerDescriptionSection: React.FC<SellerDescriptionSectionProps> = ({ content, paragraphs }) => (
  /* data-component="ProductDescriptionSection" */
  <section className="bg-canvas-soft rounded p-space-md md:p-space-xl mb-space-xl">
    <div className="flex flex-wrap items-center justify-between gap-space-xs mb-space-md">
      <h2 className="font-heading-3 text-heading-3 text-ink flex items-center gap-2">
        <Icon className="text-primary" name="description" />
        <span>{content.title}</span>
      </h2>
    </div>
    <ExpandableDescription
      collapseLabel={content.collapseLabel}
      expandLabel={content.expandLabel}
      paragraphs={paragraphs}
      variant="seller"
    />
  </section>
);

export default SellerDescriptionSection;
