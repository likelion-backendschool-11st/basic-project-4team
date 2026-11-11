import React from 'react';
import { Link } from 'react-router-dom';
import { authHeader } from '../../data/auth';
import { brand, ROUTES } from '../../data/layout';
import { Icon } from '../common/Icon';

interface AuthTopBarProps {
  readonly className?: string;
}

/* data-component="GNB" */
export const AuthTopBar: React.FC<AuthTopBarProps> = ({ className = '' }) => (
  <header className={`w-full bg-canvas border-b border-hairline px-6 py-4 ${className}`}>
    <div className="max-w-7xl mx-auto flex items-center justify-between gap-space-md">
      <Link aria-label={authHeader.logoAriaLabel} className="flex items-center gap-2 shrink-0" to={ROUTES.home}>
        <img alt={brand.name} className="h-8 w-auto object-contain" src={brand.logoSrc} />
      </Link>
      <nav aria-label="보조 메뉴" className="flex items-center gap-6 text-sm font-medium text-muted">
        {authHeader.links.map((link) => (
          <Link className="hover:text-ink transition-colors flex items-center gap-1.5" key={link.label} to={link.to}>
            {link.icon && <Icon className="text-[18px] text-muted" name={link.icon} />}
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  </header>
);

export default AuthTopBar;
