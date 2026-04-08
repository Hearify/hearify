import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import uk from '@src/assets/uk.json';
import en from '@src/assets/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    returnObjects: true,
    defaultNS: 'general',
    fallbackNS: 'general',
    resources: {
      en: {
        general: en,
      },
      uk: {
        general: uk,
      },
    },
  });

export const t = i18n.t.bind(i18n);

export default i18n;
