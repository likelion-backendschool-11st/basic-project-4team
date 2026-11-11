import React from 'react';
import { Icon } from '../common/Icon';
import { authPhotoCopy, createAuthSamplePhoto, type ListingPhoto } from '../../data/listingForm';
import { useAuthPhoto } from '../../hooks/listing-form/useAuthPhoto';

interface AuthPhotoPanelProps {
  readonly step: number;
  readonly initialPhoto: ListingPhoto | null;
  readonly onChange: (photo: ListingPhoto | null) => void;
  readonly error?: string;
}

/** Create section 2 — required physical-verification (handwritten slip) photo upload. */
export const AuthPhotoPanel: React.FC<AuthPhotoPanelProps> = ({ step, initialPhoto, onChange, error }) => {
  const { photo, setFile } = useAuthPhoto(initialPhoto, onChange);
  const copy = authPhotoCopy.create;
  const preview = photo ?? createAuthSamplePhoto;

  return (
    // data-subcomponent="PhysicalAuthSlipUpload"
    <div className="bg-lime-panel p-space-lg rounded shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
        <div className="flex items-start gap-space-sm">
          <div className="w-6 h-6 rounded-full bg-forest text-on-primary font-ui-label text-ui-label flex items-center justify-center shrink-0 mt-0.5">
            {step}
          </div>
          <div>
            <div className="flex items-center gap-space-xs flex-wrap">
              <span className="font-ui-label text-ui-label text-forest flex items-center gap-1">
                <Icon className="text-[18px]" name="verified_user" />
                {copy.title}
              </span>
              <span className="bg-error text-on-error font-micro text-micro px-1.5 py-0.5 rounded font-bold">{copy.requiredBadge}</span>
              <span className="bg-mint-200 text-forest font-micro text-micro px-1.5 py-0.5 rounded">{copy.markBadge}</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-secondary-fixed-variant mt-1 leading-snug">
              {copy.bodyPrefix}
              <strong className="text-ink">{copy.bodyStrong}</strong>
              {copy.bodySuffix}
              <br />
              {copy.body2Prefix}
              <span className="text-forest font-bold">{copy.body2Badge}</span>
              {copy.body2Suffix}
            </p>
            {error && <p className="font-caption text-caption text-error mt-1">{error}</p>}
          </div>
        </div>
        <div className="w-full sm:w-auto shrink-0 flex items-center gap-space-sm">
          <div className="relative w-28 h-20 bg-canvas rounded overflow-hidden shrink-0 shadow-sm">
            <img alt={preview.alt} className={`w-full h-full object-cover ${photo ? '' : 'opacity-60'}`} src={preview.src} />
            <span className="absolute top-1.5 left-1.5 bg-primary text-on-primary font-micro text-micro px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm font-bold">
              <Icon className="text-[12px]" name={photo ? 'check_circle' : 'image'} />
              {photo ? copy.verifiedBadge : copy.sampleBadge}
            </span>
          </div>
          <label className="cursor-pointer bg-forest hover:bg-primary-deep text-on-primary font-ui-sm text-ui-sm px-space-md py-2.5 rounded transition-colors flex items-center gap-1 shrink-0">
            <input accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files)} type="file" />
            <Icon className="text-[16px]" name="add_a_photo" />
            <span>{photo ? copy.changeLabel : copy.addLabel}</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default AuthPhotoPanel;
