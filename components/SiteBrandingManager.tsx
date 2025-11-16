import { useEffect } from 'react';
import { defaultContent } from '../content/defaultContent';
import { fetchSettings } from '../services/apiClient';
import { applyDocumentBranding } from '../utils/documentBranding';

const SiteBrandingManager = () => {
  useEffect(() => {
    applyDocumentBranding({
      companyName: defaultContent.settings.companyName,
      heroHeadline: defaultContent.settings.heroHeadline,
      logoUrl: defaultContent.settings.logoUrl,
    });

    let isMounted = true;

    const syncBranding = async () => {
      try {
        const response = await fetchSettings();
        if (!isMounted) return;
        applyDocumentBranding({
          companyName: response.settings.companyName,
          heroHeadline: response.settings.heroHeadline,
          logoUrl: response.settings.logoUrl,
        });
      } catch (error) {
        console.warn('[SiteBrandingManager] Failed to load site branding', error);
      }
    };

    syncBranding();

    return () => {
      isMounted = false;
    };
  }, []);

  return null;
};

export default SiteBrandingManager;
