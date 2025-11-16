import { defaultContent } from '../content/defaultContent';

type BrandingPayload = {
  companyName?: string | null;
  heroHeadline?: string | null;
  logoUrl?: string | null;
};

const DEFAULT_TITLE =
  [defaultContent.settings.companyName, defaultContent.settings.heroHeadline].filter(Boolean).join(' - ') ||
  'AI Studio';

const DEFAULT_FAVICON = '/vite.svg';

const sanitize = (value?: string | null) => value?.trim() || '';

export const applyDocumentBranding = (payload?: BrandingPayload) => {
  if (typeof document === 'undefined') {
    return;
  }

  const companyName = sanitize(payload?.companyName);
  const heroHeadline = sanitize(payload?.heroHeadline);
  const logoUrl = sanitize(payload?.logoUrl);

  const nextTitle = companyName || heroHeadline ? [companyName, heroHeadline].filter(Boolean).join(' - ') : DEFAULT_TITLE;
  if (document.title !== nextTitle) {
    document.title = nextTitle;
  }

  const favicon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (favicon) {
    favicon.href = logoUrl || DEFAULT_FAVICON;
  }
};
