import { useMemo } from 'react';
import useChatStore from '../store/chatStore';
import { translations } from './translations';

export function useTranslation() {
  const language = useChatStore((s) => s.language);

  const t = useMemo(() => {
    const lang = translations[language] || translations.en;
    const en = translations.en;
    return (key) => {
      const keys = key.split('.');
      let val = lang;
      let fallback = en;
      for (const k of keys) {
        val = val?.[k];
        fallback = fallback?.[k];
      }
      return val || fallback || key;
    };
  }, [language]);

  return { t, language };
}
