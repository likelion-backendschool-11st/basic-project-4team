import React from 'react';
import { Link } from 'react-router-dom';
import { brand, footerData } from '../../data/layout';
import { Icon } from '../common/Icon';

interface FooterProps {
  readonly data?: typeof footerData;
}

/* data-component="Footer" */
export const Footer: React.FC<FooterProps> = ({ data = footerData }) => (
  <footer className="w-full bg-canvas-soft border-t border-hairline py-space-section">
    <div className="max-w-7xl mx-auto px-gutter-desktop">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter-desktop mb-space-xl">
        <div className="md:col-span-4">
          <div className="flex items-center gap-space-xs mb-space-xs">
            <img alt={brand.logoAlt} className="h-7 w-auto object-contain" src={brand.logoSrc} />
          </div>
          <p className="font-body-sm text-body-sm text-muted mb-space-md">{brand.tagline}</p>
          <div className="flex items-center gap-space-sm text-muted">
            {data.socials.map((s) => (
              <a aria-label={s.label} className="p-1.5 rounded hover:bg-canvas transition-colors" href={s.href} key={s.label} rel="noreferrer" target="_blank">
                <Icon className="text-[20px]" name={s.icon} />
              </a>
            ))}
          </div>
        </div>
        <div className="md:col-span-5 md:border-l border-hairline md:pl-gutter-desktop">
          <h4 className="font-ui-label text-ui-label text-ink mb-space-xs">{data.businessTitle}</h4>
          <p className="font-caption text-caption text-muted leading-relaxed mb-space-sm">
            {data.businessLines.map((line) => (
              <span className="block" key={line}>{line}</span>
            ))}
          </p>
          <p className="font-micro text-micro text-muted leading-relaxed">{data.disclaimer}</p>
        </div>
        <div className="md:col-span-3 md:border-l border-hairline md:pl-gutter-desktop flex flex-col gap-1.5">
          <h4 className="font-ui-label text-ui-label text-ink mb-1">{data.supportTitle}</h4>
          {data.supportLinks.map((l) => (
            <Link
              className={`font-caption text-caption transition-colors ${l.strong ? 'text-ink font-bold hover:underline' : 'text-muted hover:text-ink'}`}
              key={l.label}
              to={l.to}
            >
              {l.label}
            </Link>
          ))}
          <a className="font-ui-sm text-ui-sm text-link hover:underline mt-1" href="tel:1588-0000">{data.csLabel}</a>
        </div>
      </div>
      <div className="border-t border-hairline pt-space-md flex flex-col md:flex-row items-center justify-between gap-space-xs text-muted font-caption text-caption">
        <p>{data.copyright}</p>
        <p>{data.footnote}</p>
      </div>
    </div>
  </footer>
);

export default Footer;
