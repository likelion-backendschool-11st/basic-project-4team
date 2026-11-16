import React from 'react';
import { imageViewerCopy, type CommunityImage } from '../../data/community';
import { useImageViewer } from '../../hooks/community/useImageViewer';
import { ImageViewer } from './ImageViewer';

export interface PostImagesProps {
  readonly images: readonly CommunityImage[];
  /** `grid` = feed 3-column preview, `strip` = discussion horizontal thumbnails. */
  readonly variant?: 'grid' | 'strip';
}

/** 글 사진 썸네일. 누르면 확대 보기(ImageViewer)가 열린다. */
export const PostImages: React.FC<PostImagesProps> = ({ images, variant = 'grid' }) => {
  const viewer = useImageViewer(images.length);
  const grid = variant === 'grid';

  return (
    <>
      <div className={grid ? 'grid grid-cols-3 gap-space-xs mb-space-md' : 'mb-space-md flex gap-space-xs overflow-x-auto pb-1'}>
        {images.map((img, i) => (
          <button
            aria-label={imageViewerCopy.openLabel(i + 1)}
            className={`group overflow-hidden cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              grid ? 'rounded bg-surface-container-high h-24 sm:h-44' : 'relative w-40 h-28 rounded-lg bg-surface-container-low shrink-0'
            }`}
            key={img.src}
            onClick={() => viewer.open(i)}
            type="button"
          >
            <img
              alt={img.alt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              src={img.src}
            />
          </button>
        ))}
      </div>
      <ImageViewer images={images} index={viewer.index} onClose={viewer.close} onNext={viewer.next} onPrev={viewer.prev} />
    </>
  );
};

export default PostImages;
