import React from 'react';
import { Link } from 'react-router-dom';
import type { AuthLink } from '../../data/auth';

interface AuthUtilityLinksProps {
  readonly links: readonly AuthLink[];
}

/* data-component="AuthUtilityLinks" */
export const AuthUtilityLinks: React.FC<AuthUtilityLinksProps> = ({ links }) => (
  <nav
    aria-label="계정 관리 링크"
    className="mt-6 pt-5 border-t border-hairline flex items-center justify-center gap-3 text-xs sm:text-sm text-muted"
  >
    {links.map((link, index) => (
      <React.Fragment key={link.label}>
        {index > 0 && (
          <span aria-hidden="true" className="text-hairline-strong select-none">
            |
          </span>
        )}
        <Link
          className={
            link.strong
              ? 'hover:text-primary-container text-link font-bold transition-colors'
              : 'hover:text-ink transition-colors font-medium'
          }
          to={link.to}
        >
          {link.label}
        </Link>
      </React.Fragment>
    ))}
  </nav>
);

export default AuthUtilityLinks;
