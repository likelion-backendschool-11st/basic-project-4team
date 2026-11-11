import { useMemo, useState } from 'react';
import type { RankingFilterId, RankingProduct } from '../../data/home';

/** Active filter tab + filtered product list for the market ranking grid. */
export const useRankingFilter = (products: readonly RankingProduct[], initial: RankingFilterId = 'all') => {
  const [active, setActive] = useState<RankingFilterId>(initial);
  const visible = useMemo(
    () => (active === 'all' ? products : products.filter((p) => p.filter === active)),
    [active, products],
  );
  return { active, setActive, visible };
};

export default useRankingFilter;
