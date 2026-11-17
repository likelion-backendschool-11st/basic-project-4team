import { toAssetUrl } from '../../api/client';
import type { ListingSummary } from '../../api/types';
import { relatedListingsCopy as copy, type RelatedListing, type SellerOtherItem } from '../../data/listing';
import { formatPrice, formatTimeAgo } from './listingViewHelpers';

/** "미개봉" / "개봉" / "PSA 10". 미개봉·그레이딩은 강조색, 개봉은 흐린 색. */
const toCondition = (listing: ListingSummary) => ({
  condition:
    listing.condition === 'graded' && listing.gradingService && listing.grade
      ? copy.graded(listing.gradingService, listing.grade)
      : copy.conditions[listing.condition],
  conditionTone: listing.condition === 'opened_raw' ? ('muted' as const) : ('primary' as const),
});

const toImage = (listing: ListingSummary) => ({
  imageSrc: listing.thumbnailUrl ? toAssetUrl(listing.thumbnailUrl) : '',
  imageAlt: listing.title,
});

/**
 * ListingSummary(ITEM-05) → "같은 품목의 다른 매물" 카드.
 * 구매자 카드는 가격에 "원"을 붙이고, 판매자 카드는 단위를 따로 표시하므로 숫자만 넘긴다.
 */
export const toRelatedListing = (
  listing: ListingSummary,
  variant: 'buyer' | 'seller',
  now = Date.now(),
): RelatedListing => {
  const price = formatPrice(listing.price);
  return {
    id: String(listing.id),
    title: listing.title,
    price: variant === 'buyer' ? copy.priceWithCurrency(price) : price,
    location: listing.directLocation ?? copy.deliveryOnly,
    timeAgo: formatTimeAgo(listing.createdAt, now),
    category: listing.item.setName ?? listing.item.name,
    ...toCondition(listing),
    ...toImage(listing),
  };
};

/** ListingSummary(LISTING-10) → "판매자의 다른 상품" 미니 카드. */
export const toSellerOtherItem = (listing: ListingSummary): SellerOtherItem => ({
  id: String(listing.id),
  title: listing.title,
  price: copy.priceWithCurrency(formatPrice(listing.price)),
  ...toCondition(listing),
  ...toImage(listing),
});
