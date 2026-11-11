import React from 'react';
import { Icon } from '../common/Icon';
import type { RelatedListing } from '../../data/listing';
import { useCarouselScroll } from '../../hooks/listing/useCarouselScroll';
import { RelatedListingCard } from './RelatedListingCard';

interface RelatedListingsCarouselProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly description: string;
  readonly items: readonly RelatedListing[];
  readonly variant?: 'buyer' | 'seller';
}

/** Horizontally scrollable "같은 품목의 다른 매물" section with arrow controls. */
export const RelatedListingsCarousel: React.FC<RelatedListingsCarouselProps> = ({
  title,
  subtitle,
  description,
  items,
  variant = 'buyer',
}) => {
  const seller = variant === 'seller';
  const { ref, scrollPrev, scrollNext } = useCarouselScroll(seller ? 280 : 260);
  const arrowClass = seller
    ? 'w-8 h-8 rounded bg-canvas-soft hover:bg-mint-100 text-ink flex items-center justify-center transition-colors'
    : 'w-8 h-8 rounded border border-hairline bg-canvas hover:bg-canvas-soft flex items-center justify-center text-body hover:text-ink';

  return (
    /* data-component="RelatedListingsCarousel" / "SameItemMarketplaceSlider" */
    <section className={seller ? 'w-full mb-space-xxl' : 'pt-space-lg border-t border-hairline'}>
      <div className="flex items-start sm:items-center justify-between gap-space-sm mb-space-md">
        <div>
          {seller ? (
            <>
              <h2 className="font-heading-3 text-heading-3 text-ink">{title}</h2>
              <p className="font-body-sm text-body-sm text-muted">{description}</p>
            </>
          ) : (
            <>
              <h3 className="font-heading-3 text-heading-3 text-ink flex flex-wrap items-center gap-x-2">
                <span>{title}</span>
                {subtitle && <span className="font-caption text-caption text-muted font-normal">{subtitle}</span>}
              </h3>
              <p className="font-caption text-caption text-muted mt-0.5">{description}</p>
            </>
          )}
        </div>
        <div className="flex items-center gap-space-xs shrink-0">
          <button aria-label="이전 다른 매물" className={arrowClass} onClick={scrollPrev} type="button">
            <Icon className="text-[18px]" name="arrow_back" />
          </button>
          <button aria-label="다음 다른 매물" className={arrowClass} onClick={scrollNext} type="button">
            <Icon className="text-[18px]" name="arrow_forward" />
          </button>
        </div>
      </div>
      <div
        ref={ref}
        className={`flex gap-gutter-desktop overflow-x-auto scroll-smooth ${seller ? 'pb-4' : 'pb-space-sm'}`}
      >
        {items.map((item) => (
          <RelatedListingCard key={item.id} item={item} variant={variant} />
        ))}
      </div>
    </section>
  );
};

export default RelatedListingsCarousel;
