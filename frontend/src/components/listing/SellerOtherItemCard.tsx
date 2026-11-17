import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../data/layout';
import { Icon } from '../common/Icon';
import type { SellerOtherItem } from '../../data/listing';

interface SellerOtherItemCardProps {
  readonly item: SellerOtherItem;
}

/** Mini product tile in "판매자의 다른 상품". */
export const SellerOtherItemCard: React.FC<SellerOtherItemCardProps> = ({ item }) => (
  <Link
    className="group border border-hairline rounded p-1.5 hover:border-primary-container transition-all bg-canvas flex flex-col justify-between min-w-0"
    to={ROUTES.listingDetail(item.id)}
  >
    <div className="aspect-square bg-canvas-soft rounded overflow-hidden mb-1.5 relative">
      {item.imageSrc ? (
        <img
          alt={item.imageAlt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
          src={item.imageSrc}
        />
      ) : (
        <span className="w-full h-full flex items-center justify-center text-faint">
          <Icon className="text-[24px]" name="image_not_supported" />
        </span>
      )}
    </div>
    <div className="flex flex-col min-w-0">
      <span className="font-caption text-caption text-ink font-medium truncate">{item.title}</span>
      <span className="font-ui-sm text-ui-sm text-forest font-bold mt-0.5">{item.price}</span>
      <span className={`font-micro text-micro mt-0.5 ${item.conditionTone === 'muted' ? 'text-muted' : 'text-primary-container'}`}>
        {item.condition}
      </span>
    </div>
  </Link>
);

export default SellerOtherItemCard;
