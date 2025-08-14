import { getRequestConfig } from 'next-intl/server';

export const locales = ['da', 'en'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  // Simplify - always use Danish for now
  const locale = 'da';
  
  // Load messages directly
  const messages = (await import(`../../messages/da.json`)).default;
  
  return {
    locale,
    messages
  };
});