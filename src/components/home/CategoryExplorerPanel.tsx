import React from 'react';
import { categoryExplorer } from '../../data/home';
import { CategoryBanner } from './CategoryBanner';
import { CategoryColumnCard } from './CategoryColumnCard';
import { CategoryToggleButton } from './CategoryToggleButton';

interface CategoryExplorerPanelProps {
  readonly open: boolean;
  readonly onToggle: () => void;
}

const PANEL_ID = 'megaMenuContainer';

/* data-component="CategoryRail" / data-purpose="category-megamenu-panel" */
export const CategoryExplorerPanel: React.FC<CategoryExplorerPanelProps> = ({ open, onToggle }) => (
  <div className="bg-canvas border-b border-hairline">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <CategoryToggleButton controlsId={PANEL_ID} label={categoryExplorer.toggleLabel} onToggle={onToggle} open={open} />
    </div>
    {open && (
      <div className="border-t border-hairline bg-canvas shadow-xl" id={PANEL_ID}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 mb-5 border-b border-hairline">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-container rounded-full" />
              <h2 className="font-eyebrow text-eyebrow uppercase tracking-wider text-muted">{categoryExplorer.title}</h2>
            </div>
            <span className="text-[11px] text-faint">{categoryExplorer.subtitle}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {categoryExplorer.columns.map((column) => (
              <CategoryColumnCard column={column} key={column.id} />
            ))}
          </div>
          <CategoryBanner {...categoryExplorer.banner} />
        </div>
      </div>
    )}
  </div>
);

export default CategoryExplorerPanel;
