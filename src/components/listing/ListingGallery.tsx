import React from 'react';
import { Icon } from '../common/Icon';
import type { GalleryImage } from '../../data/listing';
import { useImageGallery } from '../../hooks/listing/useImageGallery';

export type GalleryVariant = 'buyer' | 'seller';

interface ListingGalleryProps {
  readonly images: readonly GalleryImage[];
  /** Additional thumbnails that point at an existing slide (seller view). */
  readonly extraThumbs?: readonly GalleryImage[];
  readonly variant?: GalleryVariant;
}

const styles = {
  buyer: {
    root: 'lg:col-span-5 flex flex-col',
    stage:
      'relative w-full aspect-[4/5] bg-canvas-soft rounded overflow-hidden border border-hairline group flex items-center justify-center',
    image: 'w-full h-full object-contain p-space-sm transition-opacity duration-300',
    navBtn:
      'absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-canvas/90 hover:bg-canvas text-ink border border-hairline shadow-sm flex items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-105 active:scale-95',
    prevPos: 'left-3',
    nextPos: 'right-3',
    counter:
      'absolute bottom-3 right-3 bg-ink/75 text-canvas font-micro text-micro px-2 py-0.5 rounded-full backdrop-blur-sm',
    thumbGrid: 'grid gap-space-xs mt-space-sm',
    thumbBase: 'rounded overflow-hidden aspect-square bg-canvas-soft relative hover:opacity-100 transition-all',
    thumbActive: 'border-2 border-primary-container opacity-100',
    thumbIdle: 'border border-hairline opacity-60',
    badgePos: 'top-1 left-1',
    badge:
      'bg-ink/75 text-canvas font-micro text-[10px] px-1 py-0.5 rounded font-medium backdrop-blur-sm pointer-events-none',
    badgeVerified:
      'bg-primary-container text-on-primary font-micro text-[10px] px-1.5 py-0.5 rounded font-bold backdrop-blur-sm pointer-events-none flex items-center gap-0.5',
  },
  seller: {
    root: 'lg:col-span-5 flex flex-col gap-space-sm',
    stage: 'relative w-full aspect-square bg-canvas-soft rounded overflow-hidden flex items-center justify-center group',
    image: 'w-full h-full object-cover',
    navBtn:
      'absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded bg-ink/70 hover:bg-forest text-on-primary flex items-center justify-center transition-colors',
    prevPos: 'left-2',
    nextPos: 'right-2',
    counter: 'absolute bottom-3 right-3 bg-ink/80 text-on-primary font-caption text-caption px-2 py-0.5 rounded',
    thumbGrid: 'grid gap-space-xs',
    thumbBase: 'relative aspect-square rounded overflow-hidden bg-canvas-soft hover:opacity-100 transition-opacity',
    thumbActive: 'ring-2 ring-primary opacity-100',
    thumbIdle: 'opacity-60',
    badgePos: 'bottom-1 left-1',
    badge: 'bg-ink/80 text-on-primary font-micro text-micro px-1 py-0.5 rounded backdrop-blur-sm',
    badgeVerified:
      'bg-primary text-on-primary font-micro text-micro px-1 py-0.5 rounded backdrop-blur-sm font-bold flex items-center gap-0.5',
  },
} as const;

const gridCols: Record<number, string> = {
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};

/** Main image viewer with prev/next arrows, counter badge and thumbnail rail. */
export const ListingGallery: React.FC<ListingGalleryProps> = ({ images, extraThumbs = [], variant = 'buyer' }) => {
  const s = styles[variant];
  const { index, total, prev, next, select } = useImageGallery(images.length);
  const thumbs = [...images.map((img, i) => ({ ...img, targetIndex: i })), ...extraThumbs];
  const current = images[index];

  return (
    /* data-component="ProductGallery" / "ProductGallerySlider" */
    <div className={s.root}>
      <div className={s.stage}>
        {variant === 'seller' ? (
          <div
            className="w-full h-full flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {images.map((img) => (
              <div key={img.src} className="w-full h-full shrink-0 flex items-center justify-center bg-canvas-soft">
                <img alt={img.alt} className={s.image} src={img.src} />
              </div>
            ))}
          </div>
        ) : (
          <img key={current.src} alt={current.alt} className={s.image} src={current.src} />
        )}

        <button aria-label="이전 이미지" className={`${s.navBtn} ${s.prevPos}`} onClick={prev} type="button">
          <Icon className="text-[20px]" name="chevron_left" />
        </button>
        <button aria-label="다음 이미지" className={`${s.navBtn} ${s.nextPos}`} onClick={next} type="button">
          <Icon className="text-[20px]" name="chevron_right" />
        </button>

        <div className={s.counter}>
          {index + 1} / {total}
        </div>
      </div>

      <div className={`${s.thumbGrid} ${gridCols[thumbs.length] ?? 'grid-cols-5'}`}>
        {thumbs.map((thumb, i) => {
          const target = thumb.targetIndex ?? i;
          const active = i < images.length && target === index;
          return (
            <button
              key={`${thumb.label}-${i}`}
              aria-label={`${thumb.label} 이미지 보기`}
              className={`${s.thumbBase} ${active ? s.thumbActive : s.thumbIdle}`}
              onClick={() => select(target)}
              type="button"
            >
              <img alt={`${thumb.label} 썸네일`} className="w-full h-full object-cover" src={thumb.thumbSrc ?? thumb.src} />
              <span className={`absolute ${s.badgePos} ${thumb.verified ? s.badgeVerified : s.badge}`}>
                {thumb.verified && <Icon className="text-[10px]" name="verified" />}
                {thumb.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ListingGallery;
