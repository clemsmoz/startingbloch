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
  const stored = typeof window !== 'undefined' ? localStorage.getItem('sb_lang') : null;
  const current = stored ?? (i18n.language?.length ? i18n.language : 'fr');

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
