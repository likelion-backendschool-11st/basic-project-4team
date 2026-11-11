import React from 'react';
import { googleLogoPaths } from '../../data/auth';

interface GoogleLogoProps {
  readonly className?: string;
}

/** Multi-colour Google "G" mark — fills come from the data file (third-party brand colours). */
export const GoogleLogo: React.FC<GoogleLogoProps> = ({ className = 'w-4 h-4' }) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
    {googleLogoPaths.map((p) => (
      <path d={p.d} fill={p.fill} key={p.fill} />
    ))}
  </svg>
);

export default GoogleLogo;
