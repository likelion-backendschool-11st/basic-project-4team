import type { Tone } from '../../data/home';

/** Theme-token class sets per tone (design's amber/blue/purple/emerald mapped to closest theme tokens). */
export const toneBadgeClasses: Record<Tone, string> = {
  brand: 'text-primary-deep bg-mint-50 border-mint-200',
  info: 'text-link bg-surface-container-low border-info/40',
  tertiary: 'text-tertiary bg-tertiary-fixed/40 border-tertiary-fixed-dim',
  lime: 'text-on-secondary-container bg-lime-panel border-lime-ribbon',
  neutral: 'text-body bg-canvas-soft border-hairline-strong',
};

export const toneFrameClasses: Record<Tone, string> = {
  brand: 'border-primary-container bg-mint-50',
  info: 'border-info bg-surface-container-low',
  tertiary: 'border-tertiary-container bg-tertiary-fixed/30',
  lime: 'border-secondary-fixed-dim bg-lime-panel/60',
  neutral: 'border-hairline-strong bg-surface-container',
};

export const toneTitleClasses: Record<Tone, string> = {
  brand: 'text-primary-deep',
  info: 'text-link',
  tertiary: 'text-tertiary',
  lime: 'text-on-secondary-fixed-variant',
  neutral: 'text-body',
};
