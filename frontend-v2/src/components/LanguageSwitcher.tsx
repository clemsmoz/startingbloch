import React from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { setAppLanguage } from '../i18n';

const { Option } = Select;

const flag = (code: string, label: React.ReactNode) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
  <img src={`/assets/png40px/${code}.png`} alt={typeof label === 'string' ? label : ''} style={{ width: 20, height: 14 }} />
    <span>{label}</span>
  </div>
);

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

    // prefer stored preference (localStorage) then i18n.language then default to 'fr'
    const storedRaw = typeof window !== 'undefined' ? localStorage.getItem('sb_lang') : null;
    let stored: string | null = null;
    if (storedRaw) {
      // If code previously stored an object (coerced to "[object Object]") or any invalid value,
      // attempt to parse JSON if it looks like JSON, otherwise validate against supported codes.
      if (storedRaw === '[object Object]') {
        try { localStorage.removeItem('sb_lang'); } catch (e) { /* ignore */ }
        stored = null;
      } else if (storedRaw.startsWith('{') || storedRaw.startsWith('"')) {
        try {
          const parsed = JSON.parse(storedRaw);
          if (typeof parsed === 'string' && (parsed === 'fr' || parsed === 'en')) stored = parsed;
          else if (parsed && typeof parsed.language === 'string' && (parsed.language === 'fr' || parsed.language === 'en')) stored = parsed.language;
          else { try { localStorage.removeItem('sb_lang'); } catch (e) {} }
        } catch (e) {
          // invalid JSON => remove and ignore
          try { localStorage.removeItem('sb_lang'); } catch (err) { }
          stored = null;
        }
      } else if (storedRaw === 'fr' || storedRaw === 'en') {
        stored = storedRaw;
      } else {
        // unknown format, remove it to avoid showing [object Object]
        try { localStorage.removeItem('sb_lang'); } catch (e) {}
        stored = null;
      }
    }

    // prefer stored preference then i18n.language then default to 'fr'
    const current = stored ?? (i18n.language?.length ? (i18n.language.startsWith('en') ? 'en' : 'fr') : 'fr');

    const change = (lng: string) => {
      // Use centralized helper which persists and dispatches the event
      setAppLanguage(lng).catch(() => {});
    };

  return (
    <Select value={current} onChange={change} style={{ width: 180 }}>
  <Option value="fr">{flag('fr', t('user.language_fr') ?? 'Français')}</Option>
  <Option value="en">{flag('gb', t('user.language_en') ?? 'English')}</Option>
    </Select>
  );
};

export default LanguageSwitcher;
