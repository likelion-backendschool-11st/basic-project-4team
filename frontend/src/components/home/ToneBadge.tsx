import React from 'react';
import type { Tone } from '../../data/home';
import { toneBadgeClasses } from './tones';

interface ToneBadgeProps {
  readonly tone: Tone;
  readonly label: string;
}

export const ToneBadge: React.FC<ToneBadgeProps> = ({ tone, label }) => (
  <span className={`font-bold border px-1.5 py-0.5 rounded ${toneBadgeClasses[tone]}`}>{label}</span>
);

export default ToneBadge;
