import React from 'react';
import { Icon } from '../common/Icon';
import { authPhotoCopy } from '../../data/listingForm';

interface AuthPhotoNoticeProps {
  /** True when the auth photo was replaced in this session (pending re-review). */
  readonly pending: boolean;
  readonly onReplace: (files: FileList | null) => void;
}

/** Edit-only banner confirming the physical-verification photo status. */
export const AuthPhotoNotice: React.FC<AuthPhotoNoticeProps> = ({ pending, onReplace }) => {
  const copy = authPhotoCopy.edit;
  return (
    // data-subcomponent="PhysicalAuthSlipNotice"
    <div className="p-space-sm bg-lime-panel/40 border border-lime-ribbon rounded flex flex-col sm:flex-row items-start gap-space-sm">
      <div className="flex items-start gap-space-sm flex-1">
        <div className="p-1.5 rounded bg-lime-panel text-forest shrink-0 mt-0.5">
          <Icon className="text-[20px]" name="photo_camera" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-ui-label text-ui-label text-ink">{pending ? copy.pendingTitle : copy.title}</h3>
            {!pending && (
              <span className="font-micro text-micro text-forest font-bold bg-lime-ribbon px-1.5 py-0.5 rounded">{copy.badge}</span>
            )}
          </div>
          <p className="font-caption text-caption text-body mt-0.5">
            {copy.bodyPrefix}
            <span className="font-bold text-ink">{copy.bodyStrong}</span>
            {copy.bodySuffix}
          </p>
        </div>
      </div>
      <label className="text-body hover:text-ink font-caption text-caption border border-hairline-strong bg-canvas px-2.5 py-1 rounded shrink-0 transition-colors cursor-pointer">
        <input accept="image/*" className="hidden" onChange={(e) => onReplace(e.target.files)} type="file" />
        {copy.changeLabel}
      </label>
    </div>
  );
};

export default AuthPhotoNotice;
