import type { ListingDetail } from '../../api/types';
import {
  listingDetailCopy as copy,
  type DescriptionParagraph,
  type GalleryImage,
} from '../../data/listing';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** 300000 → "300,000". */
export const formatPrice = (value: number): string => value.toLocaleString('ko-KR');

/** ISO 시각 → "3일 전". */
export const formatTimeAgo = (iso: string, now = Date.now()): string => {
  const diff = Math.max(0, now - new Date(iso).getTime());
  if (diff < MINUTE) return copy.timeAgo.justNow;
  if (diff < HOUR) return copy.timeAgo.minutes(Math.floor(diff / MINUTE));
  if (diff < DAY) return copy.timeAgo.hours(Math.floor(diff / HOUR));
  if (diff < 30 * DAY) return copy.timeAgo.days(Math.floor(diff / DAY));
  if (diff < 365 * DAY) return copy.timeAgo.months(Math.floor(diff / (30 * DAY)));
  return copy.timeAgo.years(Math.floor(diff / (365 * DAY)));
};

/** ISO 시각 → "2026.11.13" (한국 시간 기준). */
export const formatDate = (iso: string): string =>
  new Date(iso)
    .toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' })
    .replace(/\.\s?/g, '.')
    .replace(/\.$/, '');

/** 빈 줄로 문단을, 줄바꿈으로 줄을 나눈다. */
export const toParagraphs = (description: string): readonly DescriptionParagraph[] =>
  description
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => paragraph.split('\n').map((line) => [{ text: line }]));

/** 상품 사진(sortOrder 순). 사진이 하나도 없으면 품목 대표 이미지를 쓴다. */
export const toPhotoSlides = (listing: ListingDetail): GalleryImage[] => {
  const photos: GalleryImage[] = listing.images.map((img, i) => ({
    src: img.url,
    alt: `${listing.title} ${copy.photoLabel(i + 1)}`,
    label: i === 0 ? copy.photoMain : copy.photoLabel(i + 1),
  }));
  if (photos.length === 0 && !listing.authImage && listing.item.imageUrl) {
    photos.push({ src: listing.item.imageUrl, alt: listing.item.name, label: copy.photoMain });
  }
  return photos;
};

/** 실물 인증 사진 슬라이드. 없으면 null. */
export const toAuthSlide = (listing: ListingDetail): GalleryImage | null =>
  listing.authImage
    ? { src: listing.authImage.url, alt: `${listing.title} ${copy.authPhoto}`, label: copy.authPhoto, verified: true }
    : null;
