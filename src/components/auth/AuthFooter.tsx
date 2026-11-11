import React from 'react';
import { Link } from 'react-router-dom';
import { authFooter } from '../../data/auth';
import { Icon } from '../common/Icon';

interface AuthFooterProps {
  readonly className?: string;
}

/* data-component="Footer" */
export const AuthFooter: React.FC<AuthFooterProps> = ({ className = '' }) => (
  <footer className={`w-full bg-canvas border-t border-hairline py-8 px-6 text-center ${className}`}>
    <div className="max-w-7xl mx-auto space-y-3">
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted">
        {authFooter.links.map((link) => (
          <Link className={`hover:text-ink transition-colors ${link.strong ? 'font-bold text-ink' : ''}`} key={link.label} to={link.to}>
            {link.label}
          </Link>
        ))}
      </div>
      <p className="text-xs text-muted flex items-center justify-center gap-1.5">
        <Icon className="text-[14px] text-primary-container" name="verified_user" />
        {authFooter.securityNote}
      </p>
      <p className="text-xs text-muted/70 tracking-tight">{authFooter.copyright}</p>
    </div>
  </footer>
);

export default AuthFooter;
