import { useEffect, useState } from 'react';
import { searchItems } from '../../api/itemcommunity';
import type { ItemSearchResult } from '../../api/types';
import { feedComposer } from '../../data/community';

export type ItemTagSearchStatus = 'idle' | 'loading' | 'ready' | 'error';

/** 시세 태그용 품목 검색 — 입력이 멈춘 뒤(debounce) GET /items?q= 를 부른다. */
export const useItemTagSearch = (query: string, enabled: boolean) => {
  const [results, setResults] = useState<readonly ItemSearchResult[]>([]);
  const [status, setStatus] = useState<ItemTagSearchStatus>('idle');

  useEffect(() => {
    const q = query.trim();
    if (!enabled || q.length < feedComposer.tag.minChars) {
      setResults([]);
      setStatus('idle');
      return undefined;
    }
    let cancelled = false;
    setStatus('loading');
    const timer = window.setTimeout(() => {
      searchItems(q)
        .then((items) => {
          if (cancelled) return;
          setResults(items);
          setStatus('ready');
        })
        .catch(() => {
          if (!cancelled) setStatus('error');
        });
    }, feedComposer.tag.debounceMs);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, enabled]);

  return { results, status };
};
