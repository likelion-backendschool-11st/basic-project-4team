import React from 'react';
import { Link } from 'react-router-dom';
import { itemHeaderCopy, type DiscussionItem } from '../../data/community';
import { Icon } from '../common/Icon';
import { SentimentPoll } from './SentimentPoll';

export interface ItemDiscussionHeaderProps {
  readonly item: DiscussionItem;
}

/** Item summary (thumb, grade, price, change), 현재 매물 link and sentiment gauge. */
export const ItemDiscussionHeader: React.FC<ItemDiscussionHeaderProps> = ({ item }) => (
  /* data-component="ItemDiscussionHeader" */
  <section className="bg-surface-container-lowest rounded-lg p-space-md shadow-sm">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-sm">
      <div className="flex items-center gap-space-md min-w-0">
        <div className="w-16 h-16 rounded-lg bg-surface-container-low overflow-hidden shrink-0 flex items-center justify-center p-1">
          <img alt={item.image.alt} className="w-full h-full object-contain" src={item.image.src} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-space-xs mb-space-xxs">
            <span className="font-eyebrow text-eyebrow bg-mint-100 text-forest px-space-xs py-0.5 rounded">{item.grade}</span>
            <span className="font-micro text-micro text-muted">{item.certNo}</span>
          </div>
          <h1 className="font-heading-3 text-heading-3 text-on-surface tracking-tight">{item.name}</h1>
          <div className="flex flex-wrap items-baseline gap-space-xs mt-space-xxs">
            <span className="font-stat-value text-stat-value text-on-surface">{item.price}</span>
            <span className="font-ui-label text-ui-label text-primary flex items-center">
              <Icon className="text-[16px]" name="arrow_drop_up" />
              {item.changePct}
            </span>
            <span className="font-micro text-micro text-muted">{item.changeAmount}</span>
          </div>
        </div>
      </div>
      {/* Dual Tab Switcher */}
      <div className="flex items-center bg-surface-container-low p-1 rounded-lg shrink-0 self-start sm:self-center">
        <Link
          className="px-space-md py-space-xs rounded font-ui-sm text-ui-sm text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1"
          to={itemHeaderCopy.listingTo(item.name)}
        >
          <Icon className="text-[16px]" name={itemHeaderCopy.listingIcon} />
          {itemHeaderCopy.listingLabel(item.listingCount)}
        </Link>
      </div>
    </div>
    <SentimentPoll key={item.id} seed={item.sentiment} />
  </section>
);

export default ItemDiscussionHeader;
