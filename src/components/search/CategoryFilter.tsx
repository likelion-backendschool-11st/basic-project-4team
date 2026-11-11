import React from 'react';
import type { CategoryOption } from '../../data/search';
import { Icon } from '../common/Icon';

interface CategoryFilterProps {
  readonly options: readonly CategoryOption[];
  readonly selectedId: string;
  readonly onSelect: (id: string) => void;
}

/** Category chips with optional dividers; the selected chip shows a check mark. */
export const CategoryFilter: React.FC<CategoryFilterProps> = ({ options, selectedId, onSelect }) => (
  <>
    {options.map((option, index) => {
      const selected = option.id === selectedId;
      const idleClass =
        index === 0
          ? 'text-body hover:bg-surface-container-high'
          : 'text-muted hover:text-ink hover:bg-surface-container';
      return (
        <React.Fragment key={option.id}>
          {option.dividerBefore ? <div className="h-3 w-[1px] bg-hairline-strong mx-1 hidden sm:block" /> : null}
          <button
            className={
              selected
                ? 'px-space-sm py-1 rounded bg-mint-50 text-forest font-ui-label text-ui-label shadow-sm flex items-center gap-1'
                : `px-space-sm py-1 rounded font-ui-sm text-ui-sm transition-colors ${idleClass}`
            }
            onClick={() => onSelect(option.id)}
            type="button"
          >
            <span>{option.label}</span>
            {selected ? <Icon className="text-[14px]" name="check" /> : null}
          </button>
        </React.Fragment>
      );
    })}
  </>
);

export default CategoryFilter;
