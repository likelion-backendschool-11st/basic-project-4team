import React from 'react';
import type { SelectOption } from '../../data/community';
import { Icon } from '../common/Icon';

export interface ComposerSelectProps {
  readonly icon: string;
  readonly value: string;
  readonly options: readonly SelectOption[];
  readonly onChange: (value: string) => void;
  readonly ariaLabel: string;
  /** `board` = neutral pill, `tag` = mint pill. */
  readonly tone?: 'board' | 'tag';
}

/** Compact inline select used in the feed composer header (board / post-type). */
export const ComposerSelect: React.FC<ComposerSelectProps> = ({ icon, value, options, onChange, ariaLabel, tone = 'board' }) => {
  const isTag = tone === 'tag';
  return (
    <div className={`flex items-center gap-1 px-space-xs py-0.5 rounded ${isTag ? 'bg-mint-50' : 'bg-surface-container-low'}`}>
      <Icon className={`text-[15px] ${isTag ? 'text-forest' : 'text-primary'}`} name={icon} />
      <select
        aria-label={ariaLabel}
        className={`bg-transparent font-bold outline-none cursor-pointer border-0 py-0 pl-0 pr-7 focus:ring-0 ${
          isTag ? 'font-caption text-caption text-forest' : 'font-ui-sm text-ui-sm text-on-surface'
        }`}
        onChange={(e) => onChange(e.target.value)}
        value={value}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ComposerSelect;
