import React from 'react';
import { quickPriceSteps } from '../../data/listingForm';

interface QuickPriceButtonsProps {
  readonly onAdd: (amount: number) => void;
}

/** +1만 / +5만 / +10만 chips next to the price input. */
export const QuickPriceButtons: React.FC<QuickPriceButtonsProps> = ({ onAdd }) => (
  <div className="shrink-0 flex items-center gap-1">
    {quickPriceSteps.map((s) => (
      <button
        className="bg-canvas-soft hover:bg-mint-50 text-body font-ui-sm text-ui-sm px-2.5 py-2 rounded transition-colors"
        key={s.label}
        onClick={() => onAdd(s.amount)}
        type="button"
      >
        {s.label}
      </button>
    ))}
  </div>
);

export default QuickPriceButtons;
