import React, { useId } from 'react';
import { Icon } from '../common/Icon';
import { QuickPriceButtons } from './QuickPriceButtons';
import { pricingCopy, type FormVariant } from '../../data/listingForm';
import { formatWon, parseWon, usePriceFeedback } from '../../hooks/listing-form/usePriceFeedback';

interface PriceFieldProps {
  readonly variant: FormVariant;
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly onAdd: (amount: number) => void;
  /** Edit: originally registered price (drives the price-drop alert). */
  readonly originalPrice?: number;
  readonly wishCount?: number;
  readonly error?: string;
}

/** Asking-price input with live market-price feedback. */
export const PriceField: React.FC<PriceFieldProps> = ({ variant, value, onChange, onAdd, originalPrice, wishCount = 0, error }) => {
  const id = useId();
  const fb = usePriceFeedback(value, variant, originalPrice);
  const isDanger = fb.tier === 'danger';

  if (variant === 'create') {
    const c = pricingCopy.create;
    return (
      <div className="flex flex-col gap-space-xs">
        <label className="font-caption text-caption text-body" htmlFor={id}>
          {c.priceLabel}
        </label>
        <div className="flex flex-col sm:flex-row sm:items-center gap-space-sm">
          <div className="relative flex-1">
            <input
              className="w-full bg-canvas-soft border-0 font-stat-value text-stat-value text-ink px-space-md py-2 text-right rounded focus:outline-none focus:ring-0 focus:bg-canvas pr-10 placeholder:text-faint"
              id={id}
              inputMode="numeric"
              onChange={(e) => onChange(parseWon(e.target.value))}
              placeholder="0"
              type="text"
              value={formatWon(value)}
            />
            <span className="absolute right-3 top-3 font-ui-label text-ui-label text-body">{pricingCopy.currency}</span>
          </div>
          <QuickPriceButtons onAdd={onAdd} />
        </div>
        {error && <p className="font-caption text-caption text-error">{error}</p>}
        <div className="bg-mint-50 p-space-sm rounded flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs mt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-eyebrow text-eyebrow text-forest">{c.marketLabel}</span>
            <span className="font-stat-value text-stat-value text-ink">{`${formatWon(fb.marketPrice)}${pricingCopy.currency}`}</span>
            <span className="font-caption text-caption text-muted">{c.marketHint}</span>
          </div>
          {fb.badgeText && (
            <span
              className={`font-caption text-caption font-bold bg-canvas px-2 py-0.5 rounded self-start sm:self-auto ${
                isDanger ? 'text-error' : 'text-primary-container'
              }`}
            >
              {fb.badgeText}
            </span>
          )}
        </div>
        <div
          className={`bg-error-container text-on-error-container p-space-sm rounded flex items-start gap-2 ${
            isDanger ? 'ring-1 ring-error' : ''
          }`}
          role={isDanger ? 'alert' : undefined}
        >
          <Icon className="text-[18px] text-error shrink-0 mt-0.5" name="warning" />
          <p className="font-caption text-caption leading-relaxed">
            <strong>{c.warningStrong}</strong>
            {c.warningPrefix}
            <span className="underline font-bold">{c.warningFlag}</span>
            {c.warningSuffix}
          </p>
        </div>
      </div>
    );
  }

  const e = pricingCopy.edit;
  return (
    // data-component="PriceSection"
    <div>
      <label className="block font-caption text-caption text-ink font-bold mb-1" htmlFor={id}>
        {e.priceLabel}
      </label>
      <div className="relative flex items-center max-w-sm">
        <input
          className="w-full bg-canvas border border-hairline-strong rounded pl-space-sm pr-10 py-2.5 font-stat-value text-stat-value text-ink text-right focus:border-primary focus:outline-none focus:ring-0"
          id={id}
          inputMode="numeric"
          onChange={(ev) => onChange(parseWon(ev.target.value))}
          placeholder="0"
          type="text"
          value={formatWon(value)}
        />
        <span className="absolute right-space-sm font-ui-label text-ui-label text-muted pointer-events-none">{pricingCopy.currency}</span>
      </div>
      {error && <p className="font-micro text-micro text-error mt-1">{error}</p>}
      <div className="mt-space-xs flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-caption text-caption text-muted">
            {e.marketLabel}
            <strong className="text-ink">{`${formatWon(fb.marketPrice)}${pricingCopy.currency}`}</strong>
          </span>
          {fb.badgeText && (
            <span
              className={`font-caption text-caption font-bold px-2 py-0.5 rounded border ${
                isDanger ? 'text-error bg-error-container border-error' : 'text-primary-container bg-mint-50 border-mint-200'
              }`}
            >
              {fb.badgeText}
            </span>
          )}
        </div>
        {fb.isPriceDrop && (
          <div className="p-space-xs bg-mint-50 border border-mint-200 rounded flex items-center gap-2 text-forest font-caption text-caption">
            <Icon className="text-[16px] text-primary-container shrink-0" name="notifications_active" />
            <span>
              {e.dropEmoji} <strong>{e.dropStrong}</strong>
              {e.dropPrefix}
              <strong>{`${wishCount}명`}</strong>
              {e.dropSuffix}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceField;
