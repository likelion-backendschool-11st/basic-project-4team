import React from 'react';
import { Icon } from '../common/Icon';

interface PaginationProps {
  readonly page: number;
  readonly pages: readonly number[];
  readonly hasPrev: boolean;
  readonly hasNext: boolean;
  readonly onPage: (page: number) => void;
  readonly onPrev: () => void;
  readonly onNext: () => void;
  readonly navAria: string;
  readonly prevAria: string;
  readonly nextAria: string;
  readonly summary: React.ReactNode;
}

/** "< 1 2 3 4 5 >" page navigation with a summary line. */
export const Pagination: React.FC<PaginationProps> = ({
  page,
  pages,
  hasPrev,
  hasNext,
  onPage,
  onPrev,
  onNext,
  navAria,
  prevAria,
  nextAria,
  summary,
}) => (
  // data-component="Pagination"
  <section className="flex flex-col items-center justify-center gap-space-sm pt-space-md border-t border-hairline">
    <nav aria-label={navAria} className="inline-flex items-center gap-1">
      <button
        aria-label={prevAria}
        className="w-9 h-9 flex items-center justify-center rounded text-muted hover:bg-surface-container hover:text-ink transition-colors disabled:opacity-40"
        disabled={!hasPrev}
        onClick={onPrev}
        type="button"
      >
        <Icon className="text-[20px]" name="chevron_left" />
      </button>
      {pages.map((n) =>
        n === page ? (
          <button
            aria-current="page"
            className="w-9 h-9 flex items-center justify-center rounded bg-primary-container text-on-primary font-ui-label text-ui-label font-bold shadow-sm"
            key={n}
            type="button"
          >
            {n}
          </button>
        ) : (
          <button
            className="w-9 h-9 flex items-center justify-center rounded bg-canvas text-body hover:bg-surface-container font-ui-label text-ui-label transition-colors"
            key={n}
            onClick={() => onPage(n)}
            type="button"
          >
            {n}
          </button>
        ),
      )}
      <button
        aria-label={nextAria}
        className="w-9 h-9 flex items-center justify-center rounded text-muted hover:bg-surface-container hover:text-ink transition-colors disabled:opacity-40"
        disabled={!hasNext}
        onClick={onNext}
        type="button"
      >
        <Icon className="text-[20px]" name="chevron_right" />
      </button>
    </nav>
    <p className="font-caption text-caption text-muted">{summary}</p>
  </section>
);

export default Pagination;
