import React from 'react';

interface IconProps {
  readonly name: string;
  readonly className?: string;
  readonly filled?: boolean;
}

/** Material Symbols Outlined glyph (font loaded in index.html). */
export const Icon: React.FC<IconProps> = ({ name, className = '', filled = false }) => (
  <span aria-hidden="true" className={`material-symbols-outlined ${filled ? 'fill' : ''} ${className}`}>
    {name}
  </span>
);

export default Icon;
