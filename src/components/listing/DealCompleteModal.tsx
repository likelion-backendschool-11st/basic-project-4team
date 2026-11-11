import React from 'react';
import { Icon } from '../common/Icon';
import type { DescriptionSegment } from '../../data/listing';
import { ListingModal } from './ListingModal';
import { RichText } from './RichText';

interface DealCompleteLabels {
  readonly title: string;
  readonly closeLabel: string;
  readonly intro: readonly DescriptionSegment[];
  readonly priceLabel: string;
  readonly priceHint: string;
  readonly buyerLabel: string;
  readonly buyerOptions: readonly string[];
  readonly reviewLabel: string;
  readonly cancelLabel: string;
  readonly submitLabel: string;
}

interface DealCompleteModalProps {
  readonly open: boolean;
  readonly labels: DealCompleteLabels;
  readonly currency: string;
  readonly finalPrice: string;
  readonly onFinalPriceChange: (value: string) => void;
  readonly requestReview: boolean;
  readonly onRequestReviewChange: (value: boolean) => void;
  readonly onCancel: () => void;
  readonly onSubmit: () => void;
}

/** 거래완료 및 시세 등록 모달 (final price, buyer, review push). */
export const DealCompleteModal: React.FC<DealCompleteModalProps> = ({
  open,
  labels,
  currency,
  finalPrice,
  onFinalPriceChange,
  requestReview,
  onRequestReviewChange,
  onCancel,
  onSubmit,
}) => (
  <ListingModal labelledBy="deal-modal-title" onClose={onCancel} open={open} size="lg">
    <div className="flex items-center justify-between mb-space-sm">
      <div className="flex items-center gap-space-xs text-primary-container">
        <Icon className="text-[26px]" name="task_alt" />
        <h3 className="font-heading-3 text-heading-3 text-ink" id="deal-modal-title">
          {labels.title}
        </h3>
      </div>
      <button aria-label={labels.closeLabel} className="text-muted hover:text-ink" onClick={onCancel} type="button">
        <Icon className="text-[22px]" name="close" />
      </button>
    </div>
    <p className="font-body-sm text-body-sm text-body mb-space-md leading-relaxed">
      <RichText segments={labels.intro} />
    </p>
    <div className="space-y-space-md bg-canvas-soft p-space-md rounded mb-space-lg">
      <div>
        <label className="block font-ui-label text-ui-label text-ink mb-1" htmlFor="finalPriceInput">
          {labels.priceLabel}
        </label>
        <div className="relative">
          <input
            className="w-full bg-canvas text-ink font-heading-3 text-heading-3 px-space-md py-2 rounded border-0 focus:outline-none focus:ring-2 focus:ring-primary"
            id="finalPriceInput"
            inputMode="numeric"
            onChange={(e) => onFinalPriceChange(e.target.value)}
            type="text"
            value={finalPrice}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-ui-label text-ui-label text-muted">{currency}</span>
        </div>
        <span className="font-micro text-micro text-primary-container mt-1 block">{labels.priceHint}</span>
      </div>
      <div>
        <label className="block font-ui-label text-ui-label text-ink mb-1" htmlFor="dealBuyerSelect">
          {labels.buyerLabel}
        </label>
        <select
          className="w-full bg-canvas text-ink font-ui-sm text-ui-sm px-space-sm py-2 rounded border-0 focus:outline-none focus:ring-2 focus:ring-primary"
          id="dealBuyerSelect"
        >
          {labels.buyerOptions.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <div className="flex items-start gap-2 bg-mint-50 p-space-xs rounded">
        <input
          checked={requestReview}
          className="mt-0.5 accent-primary rounded text-primary focus:ring-primary"
          id="requestReview"
          onChange={(e) => onRequestReviewChange(e.target.checked)}
          type="checkbox"
        />
        <label className="font-caption text-caption text-forest" htmlFor="requestReview">
          {labels.reviewLabel}
        </label>
      </div>
    </div>
    <div className="flex flex-wrap items-center justify-end gap-space-sm">
      <button
        className="px-space-md py-space-sm rounded bg-canvas-soft hover:bg-surface-variant font-ui-label text-ui-label text-body transition-colors"
        onClick={onCancel}
        type="button"
      >
        {labels.cancelLabel}
      </button>
      <button
        className="px-space-lg py-space-sm rounded bg-primary-container text-on-primary font-ui-label text-ui-label hover:bg-forest transition-colors"
        onClick={onSubmit}
        type="button"
      >
        {labels.submitLabel}
      </button>
    </div>
  </ListingModal>
);

export default DealCompleteModal;
