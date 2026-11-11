import React, { useId } from 'react';
import { Icon } from '../common/Icon';

interface LockedFieldProps {
  readonly label: string;
  readonly value: string;
}

/** Disabled input with a lock glyph (edit mode, immutable values). */
export const LockedField: React.FC<LockedFieldProps> = ({ label, value }) => {
  const id = useId();
  return (
    <div>
      <label className="block font-caption text-caption text-muted mb-1" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          className="w-full bg-canvas-soft border border-hairline rounded px-space-sm pr-9 py-2 font-ui-label text-ui-label text-muted cursor-not-allowed"
          disabled
          id={id}
          readOnly
          type="text"
          value={value}
        />
        <Icon className="text-outline text-[18px] absolute right-space-sm top-2.5" name="lock" />
      </div>
    </div>
  );
};

export default LockedField;
