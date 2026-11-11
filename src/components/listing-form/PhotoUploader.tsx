import React from 'react';
import { Icon } from '../common/Icon';
import { AddPhotoTile } from './AddPhotoTile';
import { AuthPhotoNotice } from './AuthPhotoNotice';
import { AuthPhotoTile } from './AuthPhotoTile';
import { PhotoThumb } from './PhotoThumb';
import { SectionCard } from './SectionCard';
import { MAX_PHOTOS, photoCopy, type FormVariant, type ListingPhoto } from '../../data/listingForm';
import { useAuthPhoto } from '../../hooks/listing-form/useAuthPhoto';
import { usePhotoUploads } from '../../hooks/listing-form/usePhotoUploads';

interface PhotoUploaderProps {
  readonly variant: FormVariant;
  readonly step: number;
  readonly initialPhotos: readonly ListingPhoto[];
  readonly onPhotosChange: (photos: readonly ListingPhoto[]) => void;
  /** Edit mode renders the auth photo as the last tile + a status notice. */
  readonly initialAuthPhoto?: ListingPhoto | null;
  readonly onAuthPhotoChange?: (photo: ListingPhoto | null) => void;
  readonly error?: string;
}

const noop = (): void => undefined;
const openPreview = (src: string): void => {
  window.open(src, '_blank', 'noopener');
};

/** Section 1 — product photo grid with upload, remove and drag-reorder. */
export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  variant,
  step,
  initialPhotos,
  onPhotosChange,
  initialAuthPhoto = null,
  onAuthPhotoChange = noop,
  error,
}) => {
  const { photos, addFiles, remove, dragHandlers } = usePhotoUploads(initialPhotos, onPhotosChange);
  const auth = useAuthPhoto(variant === 'edit' ? initialAuthPhoto : null, onAuthPhotoChange);
  const isCreate = variant === 'create';
  const total = photos.length + (!isCreate && auth.photo ? 1 : 0);

  return (
    // data-component="ImageUploadSection"
    <SectionCard
      inlineHint={
        isCreate ? (
          <span className="font-caption text-caption text-muted">{photoCopy.create.hint}</span>
        ) : (
          <span className="font-ui-sm text-ui-sm text-primary-container font-bold">{`(${total}/${MAX_PHOTOS})`}</span>
        )
      }
      right={
        isCreate ? (
          <span className="font-ui-sm text-ui-sm text-primary-container bg-mint-50 px-2 py-0.5 rounded self-start sm:self-auto">
            {`${photos.length} / ${MAX_PHOTOS}${photoCopy.create.countSuffix}`}
          </span>
        ) : (
          <span className="font-caption text-caption text-muted">{photoCopy.edit.hint}</span>
        )
      }
      step={step}
      title={isCreate ? photoCopy.create.title : photoCopy.edit.title}
      variant={variant}
    >
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-space-sm ${isCreate ? '' : 'md:grid-cols-5'}`}>
        <AddPhotoTile count={photos.length} disabled={total >= MAX_PHOTOS} onFiles={addFiles} variant={variant} />
        {photos.map((photo, index) => (
          <PhotoThumb
            dragHandlers={dragHandlers(index)}
            isMain={index === 0}
            key={photo.id}
            onPreview={() => openPreview(photo.src)}
            onRemove={() => remove(photo.id)}
            photo={photo}
            variant={variant}
          />
        ))}
        {!isCreate && auth.photo && <AuthPhotoTile onReplace={auth.setFile} photo={auth.photo} />}
      </div>

      {isCreate ? (
        <div className="flex items-center gap-1 font-caption text-caption text-muted bg-canvas-soft p-space-xs rounded">
          <Icon className="text-[16px] text-outline shrink-0" name="drag_indicator" />
          <span>{photoCopy.create.dragHint}</span>
        </div>
      ) : (
        <AuthPhotoNotice onReplace={auth.setFile} pending={auth.replaced} />
      )}

      {error && <p className="font-caption text-caption text-error">{error}</p>}
    </SectionCard>
  );
};

export default PhotoUploader;
