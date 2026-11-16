import { useMemo } from 'react';
import type { ListingDetail } from '../../api/types';
import { ROUTES } from '../../data/layout';
import {
  listingDetailCopy as copy,
  sellerDetailCopy as sellerCopy,
  sellerListing,
  type BreadcrumbItem,
  type GalleryImage,
  type ListingAttribute,
  type ListingStatus,
} from '../../data/listing';
import { formatDate, formatPrice, formatTimeAgo, toAuthSlide, toParagraphs, toPhotoSlides } from './listingViewHelpers';

const toBreadcrumbs = (listing: ListingDetail): readonly BreadcrumbItem[] => [
  ...listing.breadcrumbs.map((c) => ({ label: c.name, to: `${ROUTES.search}?category=${c.code}` })),
  { label: listing.item.setName ?? listing.item.name },
];

/** 상품 사진 뒤에 실물 인증 사진을 붙인다. */
const toGallery = (listing: ListingDetail): readonly GalleryImage[] => {
  const auth = toAuthSlide(listing);
  return auth ? [...toPhotoSlides(listing), auth] : toPhotoSlides(listing);
};

const toDeltaNote = (listing: ListingDetail): string => {
  const rate = listing.priceDiffRate;
  if (rate === null) return sellerCopy.noMarketNote;
  if (rate < 0) return sellerCopy.cheaperNote(Math.abs(rate));
  if (rate > 0) return sellerCopy.pricierNote(rate);
  return sellerCopy.sameNote;
};

const toAttributes = (listing: ListingDetail): readonly ListingAttribute[] => {
  const { item } = listing;
  const trade = [
    listing.delivery && sellerCopy.tradeDelivery,
    listing.direct && sellerCopy.tradeDirect(listing.directLocation),
  ].filter((value): value is string => Boolean(value));
  const grade = listing.gradingService && listing.grade ? ` · ${listing.gradingService} ${listing.grade}` : '';
  const attributes: ListingAttribute[] = [
    { label: copy.tradeLabel, kind: 'text', value: trade.join(sellerCopy.tradeSeparator) },
    { label: copy.conditionLabel, kind: 'badge', value: `${copy.conditions[listing.condition]}${grade}` },
  ];
  if (item.language) {
    attributes.push({ label: sellerCopy.languageLabel, kind: 'text', value: copy.languages[item.language] ?? item.language });
  }
  if (item.rarity || item.cardNo) {
    attributes.push({ label: sellerCopy.rarityLabel, kind: 'text', value: [item.rarity, item.cardNo].filter(Boolean).join(' / ') });
  }
  attributes.push({ label: copy.authLabel, kind: 'text', value: listing.authImage ? copy.authYes : copy.authNo });
  return attributes;
};

/** LISTING-02 응답을 내 판매글 상세(P-013) 컴포넌트 props 형태로 바꾼다. */
export const useSellerListingView = (listing: ListingDetail) =>
  useMemo(
    () => ({
      id: String(listing.id),
      itemSlug: listing.item.slug,
      title: listing.title,
      price: formatPrice(listing.price),
      wishCount: listing.wishCount,
      status: copy.statuses[listing.status] as ListingStatus,
      gallery: toGallery(listing),
      breadcrumbs: toBreadcrumbs(listing),
      priceInfo: {
        ...sellerListing.price,
        avgValue: listing.marketPrice ? sellerCopy.avgValue(formatPrice(listing.marketPrice.averagePrice)) : copy.noMarket,
        deltaNote: toDeltaNote(listing),
      },
      stats: {
        ...sellerListing.stats,
        registered: sellerCopy.registered(formatTimeAgo(listing.createdAt), formatDate(listing.createdAt)),
        views: formatPrice(listing.viewCount),
      },
      attributes: toAttributes(listing),
      paragraphs: toParagraphs(listing.description),
    }),
    [listing],
  );
