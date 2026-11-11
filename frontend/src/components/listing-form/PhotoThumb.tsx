import React from 'react';
import { Icon } from '../common/Icon';
import { photoCopy, type FormVariant, type ListingPhoto } from '../../data/listingForm';
import type { PhotoDragHandlers } from '../../hooks/listing-form/usePhotoUploads';

interface PhotoThumbProps {
  readonly variant: FormVariant;
  readonly photo: ListingPhoto;
  readonly isMain: boolean;
  readonly onRemove: () => void;
  readonly onPreview?: () => void;
  readonly dragHandlers: PhotoDragHandlers;
}

/** One draggable photo preview tile with badge + remove action. */
export const PhotoThumb: React.FC<PhotoThumbProps> = ({ variant, photo, isMain, onRemove, onPreview, dragHandlers }) => {
  if (variant === 'create') {
    return (
      <div className="relative h-32 bg-canvas-soft rounded overflow-hidden group cursor-move" {...dragHandlers}>
        <img alt={photo.alt} className="w-full h-full object-cover pointer-events-none" src={photo.src} />
        <span className="absolute top-2 left-2 bg-ink/70 text-on-primary font-micro text-micro px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
          {isMain && <Icon className="text-[12px] text-lime-ribbon" name="star" />}
          {isMain ? photoCopy.mainBadge : photo.label}
        </span>
        <button
          aria-label={photoCopy.removeLabel}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-ink/70 text-on-primary flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          onClick={onRemove}
          type="button"
        >
          <Icon className="text-[14px]" name="close" />
        </button>
        {photo.caption && (
          <div className="absolute bottom-1 right-2 font-micro text-micro text-canvas bg-ink/50 px-1 rounded">{photo.caption}</div>
        )}
      </div>
    );
  }

  return (
    <div className="relative h-28 rounded border border-hairline-strong overflow-hidden group bg-canvas-soft cursor-move" {...dragHandlers}>
      <img alt={photo.alt} className="w-full h-full object-cover pointer-events-none" src={photo.src} />
      <span
        className={`absolute top-1.5 left-1.5 text-on-primary font-micro text-micro px-1.5 py-0.5 rounded ${
          isMain ? 'bg-forest shadow-sm' : 'bg-ink/70'
        }`}
      >
        {isMain ? photoCopy.mainBadge : photo.label}
      </span>
      <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-center gap-1">
        <button
          className="w-7 h-7 rounded bg-canvas text-ink flex items-center justify-center hover:bg-mint-50"
          onClick={onPreview}
          title={photoCopy.previewLabel}
          type="button"
        >
          <Icon className="text-[16px]" name="visibility" />
        </button>
        <button
          className="w-7 h-7 rounded bg-canvas text-error flex items-center justify-center hover:bg-error-container"
          onClick={onRemove}
          title={photoCopy.removeLabel}
          type="button"
        >
          <Icon className="text-[16px]" name="delete" />
        </button>
      </div>
    </div>
  );
};

export default PhotoThumb;
