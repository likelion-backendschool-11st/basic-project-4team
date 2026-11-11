import React from 'react';
import type { PricePreset } from '../../data/search';

interface PriceRangeFilterProps {
  readonly min: string;
  readonly max: string;
  readonly minPlaceholder: string;
  readonly maxPlaceholder: string;
  readonly unit: string;
  readonly applyLabel: string;
  readonly presets: readonly PricePreset[];
  readonly activePresetId: string | null;
  readonly onMinChange: (value: string) => void;
  readonly onMaxChange: (value: string) => void;
  readonly onApply: () => void;
  readonly onPreset: (preset: PricePreset) => void;
}

const inputBase =
  'bg-canvas px-3 py-1.5 font-body-sm text-body-sm text-ink rounded shadow-inner border-0 focus:outline-none focus:ring-0';

/** Min/max price inputs, apply button and quick range presets. */
export const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  min,
  max,
  minPlaceholder,
  maxPlaceholder,
  unit,
  applyLabel,
  presets,
  activePresetId,
  onMinChange,
  onMaxChange,
  onApply,
  onPreset,
}) => (
  <>
    <div className="flex items-center gap-space-xs">
      <div className="relative">
        <input
          className={`w-32 ${inputBase}`}
          inputMode="numeric"
          onChange={(event) => onMinChange(event.target.value)}
          placeholder={minPlaceholder}
          type="text"
          value={min}
        />
        <span className="absolute right-2 top-2 font-caption text-caption text-muted">{unit}</span>
      </div>
      <span className="text-muted font-body-md text-body-md">~</span>
      <div className="relative">
        <input
          className={`w-36 ${inputBase}`}
          inputMode="numeric"
          onChange={(event) => onMaxChange(event.target.value)}
          placeholder={maxPlaceholder}
          type="text"
          value={max}
        />
        <span className="absolute right-2 top-2 font-caption text-caption text-muted">{unit}</span>
      </div>
    </div>
    <button
      className="bg-primary-container text-on-primary font-ui-label text-ui-label px-space-md py-1.5 rounded hover:bg-forest transition-colors shadow-sm"
      onClick={onApply}
      type="button"
    >
      {applyLabel}
    </button>
    <div className="flex flex-wrap items-center gap-1.5 ml-2 font-caption text-caption text-muted">
      {presets.map((preset) => (
        <button
          className={`px-2 py-0.5 rounded transition-colors ${
            preset.id === activePresetId ? 'bg-mint-50 text-forest' : 'bg-canvas hover:bg-surface-container'
          }`}
          key={preset.id}
          onClick={() => onPreset(preset)}
          type="button"
        >
          {preset.label}
        </button>
      ))}
    </div>
  </>
);

export default PriceRangeFilter;
