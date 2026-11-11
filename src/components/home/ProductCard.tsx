import React from 'react';
import { Link } from 'react-router-dom';
import type { RankingProduct } from '../../data/home';
import { ROUTES } from '../../data/layout';
import { ProductVisual } from './ProductVisual';
import { ToneBadge } from './ToneBadge';

interface ProductCardProps {
  readonly product: RankingProduct;
  readonly buyLabel: string;
  readonly sellLabel: string;
}

/* data-component="ProductCard" */
export const ProductCard: React.FC<ProductCardProps> = ({ product, buyLabel, sellLabel }) => (
  <article className="relative bg-canvas border border-hairline hover:border-primary-container rounded p-4 flex flex-col justify-between transition-all hover:shadow-sm group">
    <div>
      <div className="flex items-center justify-between text-xs mb-2">
        <ToneBadge label={product.categoryLabel} tone={product.tone} />
        <span className={`text-xs font-semibold ${product.trend === 'up' ? 'text-primary-container' : 'text-muted'}`}>
          {product.change}
        </span>
      </div>
      <ProductVisual visual={product.visual} />
      <h3 className="font-bold text-sm text-ink group-hover:text-primary-container transition-colors line-clamp-1">
        {/* Stretched link: whole card navigates to the listing detail */}
        <Link className="after:absolute after:inset-0" to={ROUTES.listingDetail(product.id)}>
          {product.name}
        </Link>
      </h3>
      <p className="text-xs text-muted mt-0.5">{product.subtitle}</p>
    </div>
    <div className="mt-4 pt-3 border-t border-hairline">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-muted">{product.priceLabel}</span>
        <span className="text-base font-extrabold text-ink">{product.price}</span>
      </div>
      <div className="relative z-10 mt-2.5 grid grid-cols-2 gap-1.5">
        <Link
          className="w-full py-1.5 text-center text-xs font-bold text-primary-container bg-mint-50 border border-mint-200 rounded hover:bg-primary-container hover:text-on-primary transition"
          to={ROUTES.listingDetail(product.id)}
        >
          {buyLabel}
        </Link>
        <Link
          className="w-full py-1.5 text-center text-xs font-bold text-body bg-canvas border border-hairline-strong rounded hover:bg-canvas-soft transition"
          to={ROUTES.sell}
        >
          {sellLabel}
        </Link>
      </div>
    </div>
  </article>
);

export default ProductCard;
