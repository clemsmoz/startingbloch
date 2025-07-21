import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { 
  FormControl, 
  Select, 
  MenuItem, 
  Box, 
  Typography,
  Chip
} from '@mui/material';

// Composant ultra-simple qui traduit automatiquement tout texte
const T = ({ children, ...props }) => {
  const { t, i18n } = useTranslation();
  const [updateKey, setUpdateKey] = useState(0);

  // Forcer la mise à jour quand des traductions sont ajoutées
  useEffect(() => {
    const handleUpdate = () => {
      setUpdateKey(prev => prev + 1);
    };

    // Écouter les événements de mise à jour
    i18n.on('added', handleUpdate);
    window.addEventListener('i18nUpdated', handleUpdate);

    return () => {
      i18n.off('added', handleUpdate);
      window.removeEventListener('i18nUpdated', handleUpdate);
    };
  }, [i18n]);

  // Si c'est un string simple (utiliser updateKey pour forcer le re-rendu)
  if (typeof children === 'string') {
    return <span key={updateKey}>{t(children, children)}</span>;
  }
  
  // Si c'est un composant avec des props
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...children.props,
      key: updateKey,
      children: typeof children.props.children === 'string' 
        ? t(children.props.children, children.props.children)
        : children.props.children
    });
  }
  
  return <span key={updateKey}>{children}</span>;
};

// PropTypes
T.propTypes = {
  children: PropTypes.node
};

// Sélecteur de langue stylisé avec Material-UI
export const LanguageSwitch = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
      <Select
        value={i18n.language}
        onChange={handleLanguageChange}
        displayEmpty
        renderValue={(selected) => {
          const lang = languages.find(l => l.code === selected) || languages[0];
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography component="div" sx={{ fontSize: '18px' }}>
                {lang.flag}
              </Typography>
              <Typography component="div" sx={{ fontSize: '14px', fontWeight: 500 }}>
                {lang.name}
              </Typography>
            </Box>
          );
        }}
        sx={{
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e0e0e0',
            borderWidth: '2px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3f51b5',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3f51b5',
          },
          borderRadius: '12px',
          backgroundColor: 'white',
        }}
      >
        {languages.map((lang) => (
          <MenuItem 
            key={lang.code} 
            value={lang.code}
            selected={i18n.language === lang.code}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <Typography component="div" sx={{ fontSize: '18px' }}>
                {lang.flag}
              </Typography>
              <Typography 
                component="div" 
                sx={{ 
                  fontSize: '14px',
                  fontWeight: i18n.language === lang.code ? 600 : 400,
                  color: i18n.language === lang.code ? '#3f51b5' : 'inherit'
                }}
              >
                {lang.name}
              </Typography>
              {i18n.language === lang.code && (
                <Chip 
                  label="✓" 
                  size="small" 
                  sx={{ 
                    ml: 'auto', 
                    backgroundColor: '#3f51b5', 
                    color: 'white',
                    fontSize: '12px',
                    height: '20px'
                  }} 
                />
              )}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default T;
