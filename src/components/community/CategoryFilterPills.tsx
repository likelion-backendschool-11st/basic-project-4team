import React from 'react';
import type { FeedCategory, FeedCategoryKey } from '../../data/community';

export interface CategoryFilterPillsProps {
  readonly categories: readonly FeedCategory[];
  readonly active: FeedCategoryKey;
  readonly onChange: (key: FeedCategoryKey) => void;
}

/** Horizontal category pill filter for the community feed. */
export const CategoryFilterPills: React.FC<CategoryFilterPillsProps> = ({ categories, active, onChange }) => (
  /* data-component="FilterPills" */
  <section className="flex items-center gap-space-xs overflow-x-auto py-space-xxs no-scrollbar">
    {categories.map((c) => {
      const isActive = c.key === active;
      return (
        <button
          aria-pressed={isActive}
          className={
            isActive
              ? 'px-space-md py-space-xxs rounded-full bg-forest text-on-primary font-ui-sm text-ui-sm font-bold shrink-0 flex items-center gap-space-xxs'
              : 'px-space-md py-space-xxs rounded-full bg-canvas text-on-surface hover:bg-surface-container-low font-ui-sm text-ui-sm font-medium shrink-0 shadow-sm flex items-center gap-space-xxs'
          }
          key={c.key}
          onClick={() => onChange(c.key)}
          type="button"
        >
          {c.emoji && <span>{c.emoji}</span>} {c.label}
        </button>
      );
    })}
  </section>
);

export default CategoryFilterPills;
