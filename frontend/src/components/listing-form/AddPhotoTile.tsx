import React from 'react';
import { Icon } from '../common/Icon';
import { MAX_PHOTOS, photoCopy, type FormVariant } from '../../data/listingForm';

interface AddPhotoTileProps {
  readonly variant: FormVariant;
  readonly count: number;
  readonly disabled: boolean;
  readonly onFiles: (files: FileList | null) => void;
}

/** File-picker tile that starts the photo grid. */
export const AddPhotoTile: React.FC<AddPhotoTileProps> = ({ variant, count, disabled, onFiles }) => {
  const isCreate = variant === 'create';
  const copy = isCreate ? photoCopy.create : photoCopy.edit;
  return (
    <label
      className={
        isCreate
          ? `flex flex-col items-center justify-center h-32 bg-canvas-soft hover:bg-mint-50 rounded transition-colors group ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`
          : `h-28 border border-dashed border-hairline-strong rounded flex flex-col items-center justify-center hover:border-primary-container hover:bg-mint-50/50 transition-colors p-space-xs group ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`
      }
    >
      <input
        accept="image/*"
        className="hidden"
        disabled={disabled}
        multiple
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = '';
        }}
        type="file"
      />
      <Icon
        className={`text-outline group-hover:text-primary-container ${isCreate ? 'text-[32px] mb-1' : 'text-[26px]'}`}
        name={copy.addIcon}
      />
      <span className={`font-ui-label text-ui-label text-ink ${isCreate ? 'group-hover:text-primary-container' : 'mt-1'}`}>
        {copy.addLabel}
      </span>
      <span className="font-micro text-micro text-muted">
        {isCreate ? `${count}/${MAX_PHOTOS} 추가 등록` : photoCopy.edit.addSub}
      </span>
    </label>
  );
};

export default AddPhotoTile;
