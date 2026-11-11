import React from 'react';
import { Icon } from '../common/Icon';
import type { ListingPhoto } from '../../data/listingForm';

interface AuthPhotoTileProps {
  readonly photo: ListingPhoto;
  readonly onReplace: (files: FileList | null) => void;
}

/** Edit-mode thumbnail of the physical-verification photo (forest border + lime badge). */
export const AuthPhotoTile: React.FC<AuthPhotoTileProps> = ({ photo, onReplace }) => (
  <div className="relative h-28 rounded border-2 border-forest overflow-hidden group bg-canvas-soft">
    <img alt={photo.alt} className="w-full h-full object-cover" src={photo.src} />
    <span className="absolute top-1.5 left-1.5 bg-lime-ribbon text-forest font-micro text-micro px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
      <Icon className="text-[12px]" name="verified_user" />
      {photo.label}
    </span>
    <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-center gap-1">
      <label className="w-7 h-7 rounded bg-canvas text-ink flex items-center justify-center hover:bg-mint-50 cursor-pointer">
        <input accept="image/*" className="hidden" onChange={(e) => onReplace(e.target.files)} type="file" />
        <Icon className="text-[16px]" name="edit" />
      </label>
    </div>
  </div>
);

export default AuthPhotoTile;
