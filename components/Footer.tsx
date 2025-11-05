import React from 'react';
import type { SiteSettings } from '../types';

interface FooterProps {
  settings: SiteSettings;
}

const Footer: React.FC<FooterProps> = ({ settings }) => {
  return (
    <footer className="bg-brand-surface text-brand-text-muted py-8 border-t border-brand-border">
      <div className="container mx-auto px-6 text-center">
        <div className="mb-3 flex items-center justify-center gap-3">
          {settings.logoUrl && (
            <img
              src={settings.logoUrl}
              alt={`${settings.companyName} logo`}
              className="h-12 w-auto max-w-[180px] object-contain drop-shadow-sm"
            />
          )}
          <p className="text-brand-text-dark font-semibold">{settings.companyName}</p>
        </div>
        <p>&copy; {new Date().getFullYear()} {settings.companyName}. All rights reserved.</p>
        {settings.tagline && <p className="text-sm mt-2">{settings.tagline}</p>}
        <p className="text-xs mt-3 text-brand-text-muted/80">
          Contact us at {settings.contactEmail}
          {settings.contactPhone ? ` · ${settings.contactPhone}` : ''}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
