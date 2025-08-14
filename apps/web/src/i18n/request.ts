import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = ['da', 'en'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  // Få locale fra cookie eller brug dansk som default
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'da';
  
  // Valider locale
  const validLocale = locales.includes(locale as Locale) ? locale : 'da';
  
  // Load messages
  const messages = (await import(`../../messages/${validLocale}.json`)).default;
  
  return {
    locale: validLocale,
    messages
  };
});