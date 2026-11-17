import React from 'react';
import type { ItemSearchResult } from '../../api/types';
import { toAssetUrl } from '../../api/client';
import { feedComposer, feedCopy } from '../../data/community';
import type { ItemTagSearchStatus } from '../../hooks/community/useItemTagSearch';
import { Icon } from '../common/Icon';

export interface ComposerItemTagPickerProps {
  readonly query: string;
  readonly onQueryChange: (value: string) => void;
  readonly results: readonly ItemSearchResult[];
  readonly status: ItemTagSearchStatus;
  readonly selected: ItemSearchResult | null;
  readonly onSelect: (item: ItemSearchResult) => void;
  readonly onClear: () => void;
}

const copy = feedComposer.tag;

/** 시세 태그 — 품목을 검색해 하나 고른다. 고른 뒤에는 품목·시세 칩으로 보인다. */
export const ComposerItemTagPicker: React.FC<ComposerItemTagPickerProps> = ({
  query,
  onQueryChange,
  results,
  status,
  selected,
  onSelect,
  onClear,
}) => {
  if (selected) {
    return (
      <div className="mt-space-xs flex items-center gap-space-xs p-space-xs rounded-lg bg-mint-50">
        <Icon className="text-[16px] text-forest" name={feedCopy.itemTagIcon} />
        <span className="flex-1 min-w-0 truncate font-ui-label text-ui-label text-on-surface">{selected.name}</span>
        <span className="font-caption text-caption text-forest shrink-0">{feedCopy.itemTagPrice(selected.latestPrice)}</span>
        <button aria-label={copy.removeLabel} className="p-0.5 rounded text-muted hover:text-error" onClick={onClear} type="button">
          <Icon className="text-[16px]" name="close" />
        </button>
      </div>
    );
  }

  const notice =
    status === 'loading' ? copy.searching : status === 'error' ? copy.failed : status === 'ready' && results.length === 0 ? copy.empty : null;

  return (
    <div className="mt-space-xs p-space-sm rounded-lg bg-surface-container-low">
      <label className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-canvas border border-hairline focus-within:border-primary">
        <Icon className="text-[18px] text-muted" name="search" />
        <input
          aria-label={copy.title}
          autoFocus
          className="flex-1 min-w-0 bg-transparent border-0 p-0 font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-0"
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={copy.placeholder}
          value={query}
        />
      </label>
      {notice && <p className="pt-space-xs font-caption text-caption text-muted">{notice}</p>}
      {results.length > 0 && (
        <ul className="mt-space-xs flex flex-col max-h-56 overflow-y-auto">
          {results.map((item) => (
            <li key={item.id}>
              <button
                className="w-full flex items-center gap-space-sm p-space-xs rounded-lg text-left hover:bg-surface-container"
                onClick={() => onSelect(item)}
                type="button"
              >
                <span className="w-9 h-9 rounded bg-surface-container-lowest overflow-hidden shrink-0 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img alt={item.name} className="w-full h-full object-contain" loading="lazy" src={toAssetUrl(item.imageUrl)} />
                  ) : (
                    <Icon className="text-[18px] text-muted" name="image" />
                  )}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-ui-label text-ui-label text-on-surface truncate">{item.name}</span>
                  <span className="block font-caption text-caption text-muted truncate">
                    {[item.category.name, item.setName, item.rarity].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <span className="font-caption text-caption text-on-surface shrink-0">{feedCopy.itemTagPrice(item.latestPrice)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ComposerItemTagPicker;
