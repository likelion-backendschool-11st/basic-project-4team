import React from 'react';
import { Icon } from '../common/Icon';
import type { ListingAttribute } from '../../data/listing';

interface ListingAttributeGridProps {
  readonly attributes: readonly ListingAttribute[];
  readonly variant?: 'buyer' | 'seller';
}

interface AttributeValueProps {
  readonly attr: ListingAttribute;
}

const AttributeValue: React.FC<AttributeValueProps> = ({ attr }) => {
  switch (attr.kind) {
    case 'chips':
      return (
        <div className="flex items-center gap-1">
          {attr.chips?.map((chip) => (
            <span
              key={chip}
              className="bg-canvas-soft border border-hairline-strong px-2 py-0.5 rounded text-ink font-ui-sm text-ui-sm"
            >
              {chip}
            </span>
          ))}
        </div>
      );
    case 'location':
      return (
        <span className="font-ui-label text-ui-label text-ink flex items-center gap-1 text-right">
          <Icon className="text-[16px] text-primary" name="location_on" /> {attr.value}
        </span>
      );
    case 'status':
      return (
        <span className="font-ui-label text-ui-label text-forest flex items-center gap-1 text-right">
          <span className="w-2 h-2 rounded-full bg-primary-container shrink-0" /> {attr.value}
        </span>
      );
    case 'verified':
      return (
        <span className="font-ui-label text-ui-label text-ink flex items-center gap-1 text-right">
          <Icon className="text-[16px] text-info" name="verified" /> {attr.value}
        </span>
      );
    case 'badge':
      return (
        <span className="inline-flex items-center gap-1 font-ui-label text-ui-label text-forest bg-mint-100 px-2 py-0.5 rounded">
          <Icon className="text-[14px]" name="verified_user" /> {attr.value}
        </span>
      );
    case 'mono':
      return <span className="font-mono text-ui-label font-ui-label text-primary-container text-right">{attr.value}</span>;
    default:
      return <span className="font-ui-label text-ui-label text-ink text-right">{attr.value}</span>;
  }
};

/** Two-column label/value matrix (거래 방식, 제품 상태 …). */
export const ListingAttributeGrid: React.FC<ListingAttributeGridProps> = ({ attributes, variant = 'buyer' }) => {
  const container =
    variant === 'seller'
      ? 'grid grid-cols-1 md:grid-cols-2 gap-x-gutter gap-y-2 bg-mint-50/50 p-space-md rounded mb-space-lg'
      : 'grid grid-cols-1 sm:grid-cols-2 gap-x-gutter-desktop gap-y-space-xs py-space-sm border-b border-hairline font-body-sm text-body-sm';

  return (
    <div className={container}>
      {attributes.map((attr) => (
        <div key={attr.label} className="flex items-center justify-between gap-space-xs text-body-sm font-body-sm">
          <span className="text-muted shrink-0">{attr.label}</span>
          <AttributeValue attr={attr} />
        </div>
      ))}
    </div>
  );
};

export default ListingAttributeGrid;
