import { useMemo } from 'react';
import type { ListingDetail } from '../../api/types';
import { ROUTES } from '../../data/layout';
import {
  buyerListing,
  listingCore,
  listingDetailCopy as copy,
  type BreadcrumbItem,
  type DescriptionParagraph,
  type GalleryImage,
  type ListingAttribute,
  type SpecItem,
} from '../../data/listing';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const formatPrice = (value: number): string => value.toLocaleString('ko-KR');

/** ISO 시각 → "3일 전". */
const formatTimeAgo = (iso: string, now = Date.now()): string => {
  const diff = Math.max(0, now - new Date(iso).getTime());
  if (diff < MINUTE) return copy.timeAgo.justNow;
  if (diff < HOUR) return copy.timeAgo.minutes(Math.floor(diff / MINUTE));
  if (diff < DAY) return copy.timeAgo.hours(Math.floor(diff / HOUR));
  if (diff < 30 * DAY) return copy.timeAgo.days(Math.floor(diff / DAY));
  if (diff < 365 * DAY) return copy.timeAgo.months(Math.floor(diff / (30 * DAY)));
  return copy.timeAgo.years(Math.floor(diff / (365 * DAY)));
};

/** ISO 시각 → "2026.11.13" (한국 시간 기준). */
const formatDate = (iso: string): string =>
  new Date(iso)
    .toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' })
    .replace(/\.\s?/g, '.')
    .replace(/\.$/, '');

const toBreadcrumbs = (listing: ListingDetail): readonly BreadcrumbItem[] => [
  { label: copy.home, to: ROUTES.home },
  ...listing.breadcrumbs.map((c) => ({ label: c.name, to: `${ROUTES.search}?category=${c.code}` })),
  { label: listing.item.setName ?? listing.item.name },
];

/** 상품 사진(sortOrder 순) + 실물 인증 사진. 사진이 하나도 없으면 품목 대표 이미지를 쓴다. */
const toGallery = (listing: ListingDetail): readonly GalleryImage[] => {
  const photos: GalleryImage[] = listing.images.map((img, i) => ({
    src: img.url,
    alt: `${listing.title} ${copy.photoLabel(i + 1)}`,
    label: i === 0 ? copy.photoMain : copy.photoLabel(i + 1),
  }));
  if (listing.authImage) {
    photos.push({ src: listing.authImage.url, alt: `${listing.title} ${copy.authPhoto}`, label: copy.authPhoto, verified: true });
  }
  if (photos.length === 0 && listing.item.imageUrl) {
    photos.push({ src: listing.item.imageUrl, alt: listing.item.name, label: copy.photoMain });
  }
  return photos;
};

const toPriceInfo = (listing: ListingDetail) => {
  const rate = listing.priceDiffRate;
  let deltaBadge = '';
  let deltaNote = '';
  if (rate !== null) {
    if (rate < 0) {
      deltaBadge = copy.cheaper(Math.abs(rate));
      deltaNote = copy.cheaperNote;
    } else if (rate > 0) {
      deltaBadge = copy.pricier(rate);
      deltaNote = copy.pricierNote;
    } else {
      deltaBadge = copy.samePrice;
    }
  }
  return {
    label: buyerListing.price.label,
    avgLabel: listing.marketPrice ? copy.avgLabel(formatPrice(listing.marketPrice.averagePrice)) : copy.noMarket,
    deltaBadge,
    deltaNote,
  };
};

const toAttributes = (listing: ListingDetail): readonly ListingAttribute[] => {
  const chips = [listing.delivery && copy.delivery, listing.direct && copy.direct].filter(
    (chip): chip is string => Boolean(chip),
  );
  const grade = listing.gradingService && listing.grade ? ` · ${listing.gradingService} ${listing.grade}` : '';
  const attributes: ListingAttribute[] = [{ label: copy.tradeLabel, kind: 'chips', value: '', chips }];
  if (listing.directLocation) {
    attributes.push({ label: copy.directLocationLabel, kind: 'location', value: listing.directLocation });
  }
  attributes.push({ label: copy.conditionLabel, kind: 'status', value: `${copy.conditions[listing.condition]}${grade}` });
  if (listing.status !== 'selling') {
    attributes.push({ label: copy.statusLabel, kind: 'text', value: copy.statuses[listing.status] });
  }
  attributes.push({ label: copy.authLabel, kind: 'verified', value: listing.authImage ? copy.authYes : copy.authNo });
  return attributes;
};

const toSpecs = (listing: ListingDetail): readonly SpecItem[] => {
  const { item } = listing;
  const specs: SpecItem[] = [];
  if (item.setName) specs.push({ label: copy.specSetName, value: item.setName });
  if (item.cardNo) specs.push({ label: copy.specCardNo, value: item.cardNo });
  if (item.language) specs.push({ label: copy.specLanguage, value: copy.languages[item.language] ?? item.language });
  if (item.rarity) specs.push({ label: copy.specRarity, value: item.rarity, tone: 'primary' });
  specs.push({
    label: copy.specGrade,
    value: listing.gradingService && listing.grade ? `${listing.gradingService} ${listing.grade}` : copy.conditions[listing.condition],
    tone: 'grade',
  });
  return specs;
};

/** 빈 줄로 문단을, 줄바꿈으로 줄을 나눈다. */
const toParagraphs = (description: string): readonly DescriptionParagraph[] =>
  description
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => paragraph.split('\n').map((line) => [{ text: line }]));

/** LISTING-02 응답을 구매자 상세 화면(P-010) 컴포넌트 props 형태로 바꾼다. */
export const useBuyerListingView = (listing: ListingDetail) =>
  useMemo(() => {
    const { item, seller } = listing;
    const price = formatPrice(listing.price);
    return {
      listingNo: listing.registrationNo ?? String(listing.id),
      title: listing.title,
      price,
      itemSlug: item.slug,
      breadcrumbs: toBreadcrumbs(listing),
      gallery: toGallery(listing),
      eyebrow: item.setName && item.cardNo ? copy.eyebrowCard(item.setName, item.cardNo) : item.category.name,
      setLabel: copy.setLabel(item.setName ?? item.name),
      priceInfo: toPriceInfo(listing),
      stats: {
        ...buyerListing.stats,
        registered: copy.registered(formatTimeAgo(listing.createdAt)),
        views: copy.views(formatPrice(listing.viewCount)),
      },
      attributes: toAttributes(listing),
      specs: toSpecs(listing),
      description: { ...buyerListing.description, updatedAt: copy.updatedAt(formatDate(listing.updatedAt)) },
      paragraphs: toParagraphs(listing.description),
      seller: {
        ...buyerListing.seller,
        initial: seller.nickname.charAt(0),
        name: seller.nickname,
        grade: copy.sellerGrade,
        badge: copy.sellerBadge,
        profileTo: `/users/${seller.id}`,
        trades: formatPrice(seller.soldCount),
        rating: copy.ratingEmpty,
        ratingCount: copy.ratingCountEmpty,
        otherTitle: copy.otherTitle,
        otherAllTo: `/users/${seller.id}/listings`,
        // 판매자의 다른 판매글(LISTING-10)은 아직 API가 없다.
        otherItems: [],
      },
      chat: {
        ...buyerListing.chat,
        productTitle: listing.title,
        productPrice: `${price}${listingCore.currency}`,
        productThumb: listing.thumbnailUrl ?? item.imageUrl ?? '',
        welcomeMeta: seller.nickname,
        welcomeMessage: copy.chatWelcome(listing.title),
      },
    };
  }, [listing]);
