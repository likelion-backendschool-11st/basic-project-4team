import React from 'react';
import type { CommunityImage } from '../../data/community';

export interface PostImagesProps {
  readonly images: readonly CommunityImage[];
  /** `grid` = feed 3-column preview, `strip` = discussion horizontal thumbnails. */
  readonly variant?: 'grid' | 'strip';
}

export const PostImages: React.FC<PostImagesProps> = ({ images, variant = 'grid' }) => {
  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-3 gap-space-xs mb-space-md">
        {images.map((img) => (
          <div className="rounded overflow-hidden bg-surface-container-high h-24 sm:h-44" key={img.src}>
            <img alt={img.alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" src={img.src} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="mb-space-md flex gap-space-xs overflow-x-auto pb-1">
      {images.map((img) => (
        <div className="relative w-40 h-28 rounded-lg overflow-hidden bg-surface-container-low shrink-0 group cursor-pointer" key={img.src}>
          <img alt={img.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" src={img.src} />
        </div>
      ))}
    </div>
  );
};

export default PostImages;
