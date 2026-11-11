import React from 'react';
import { Icon } from '../common/Icon';

interface TrustChipProps {
  readonly label: string;
}

export const TrustChip: React.FC<TrustChipProps> = ({ label }) => (
  <div className="flex items-center gap-1.5 bg-ink/20 px-3 py-1.5 rounded border border-on-primary/10">
    <Icon className="text-[16px] text-secondary-fixed-dim" name="check" />
    <span>{label}</span>
  </div>
);

export default TrustChip;
