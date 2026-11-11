import React from 'react';
import { Link } from 'react-router-dom';
import type { CategoryColumn } from '../../data/home';
import { toneBadgeClasses } from './tones';

interface CategoryColumnCardProps {
  readonly column: CategoryColumn;
}

export const CategoryColumnCard: React.FC<CategoryColumnCardProps> = ({ column }) => (
  <div className="bg-canvas-soft/60 p-4 rounded border border-hairline">
    <div className="flex items-center justify-between gap-2 pb-2 mb-3 border-b border-hairline-strong">
      <div className="flex items-center gap-2">
        <span className={`p-1 rounded-lg text-xs ${toneBadgeClasses[column.tone]}`}>{column.emoji}</span>
        <h3 className="font-bold text-sm text-ink">{column.title}</h3>
      </div>
      <Link className="text-[11px] text-primary-container font-semibold hover:underline shrink-0" to={column.viewAllTo}>
        {column.viewAllLabel}
      </Link>
    </div>
    <ul className="space-y-1.5 text-xs sm:text-sm">
      {column.links.map((link) => (
        <li key={link.label}>
          {link.highlighted ? (
            <Link
              className="group flex items-center justify-between px-2.5 py-2 rounded bg-mint-50 text-primary-deep font-bold border border-mint-200 hover:bg-primary-container hover:text-on-primary transition"
              title={link.title}
              to={link.to}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container group-hover:bg-canvas" />
                {link.label}
              </span>
            </Link>
          ) : (
            <Link
              className="block px-2.5 py-1.5 text-body hover:text-primary-deep hover:bg-canvas rounded font-medium transition"
              to={link.to}
            >
              {link.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
    {column.footnote && (
      <div className="mt-2 pt-2 border-t border-dashed border-hairline-strong text-[11px] text-faint">{column.footnote}</div>
    )}
  </div>
);

export default CategoryColumnCard;
