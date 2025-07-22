import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { 
  FormControl, 
  Select, 
  MenuItem, 
  Box, 
  Typography,
  Chip,
  Paper,
  Divider,
  Avatar,
  ListItemIcon,
  ListItemText,
  Grow
} from '@mui/material';
import flags from '../flags';

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

// Sélecteur de langue stylisé avec Material-UI - Design moderne et élégant
export const LanguageSwitch = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'fr', name: 'Français', flag: 'FR' },
    { code: 'en', name: 'English', flag: 'GB' },
    { code: 'es', name: 'Español', flag: 'ES' },
    { code: 'de', name: 'Deutsch', flag: 'DE' },
    { code: 'it', name: 'Italiano', flag: 'IT' },
    { code: 'pt', name: 'Português', flag: 'PT' }
  ];

  // Log pour debugger
  console.log('🔍 LanguageSwitch - Langue courante:', i18n.language);
  console.log('🔍 LanguageSwitch - Langue ready:', i18n.isInitialized);

  const handleLanguageChange = (event) => {
    const newLang = event.target.value;
    console.log('🎯 Tentative de changement de langue vers:', newLang);
    console.log('🌐 Langue courante avant changement:', i18n.language);
    
    i18n.changeLanguage(newLang)
      .then(() => {
        console.log('✅ Changement de langue réussi vers:', i18n.language);
      })
      .catch((error) => {
        console.error('❌ Erreur lors du changement de langue:', error);
      });
  };

  return (
    <Paper 
      elevation={3}
      sx={{ 
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid rgba(63, 81, 181, 0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          elevation: 6,
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(63, 81, 181, 0.15)'
        }
      }}
    >
      <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
        <Select
          value={i18n.language || 'fr'}
          onChange={handleLanguageChange}
          renderValue={(selected) => {
            console.log('🔍 renderValue - selected:', selected);
            const selectedLang = languages.find(l => l.code === selected) || languages[0];
            return (
              <Grow in={true} timeout={300}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  py: 0.5,
                  px: 1
                }}>
                  <Avatar
                    sx={{ 
                      width: 28, 
                      height: 28,
                      border: '2px solid #3f51b5',
                      transition: 'transform 0.2s ease',
                      '&:hover': { transform: 'scale(1.1)' }
                    }}
                  >
                    <img
                      src={flags[selectedLang.flag]}
                      alt={selectedLang.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  </Avatar>
                  <Box>
                    <Typography 
                      component="div" 
                      sx={{ 
                        fontSize: '14px', 
                        fontWeight: 600,
                        color: '#1a1a1a',
                        lineHeight: 1.2
                      }}
                    >
                      {selectedLang.name}
                    </Typography>
                    <Typography 
                      component="div" 
                      sx={{ 
                        fontSize: '11px', 
                        color: '#666',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {selectedLang.code}
                    </Typography>
                  </Box>
                </Box>
              </Grow>
            );
          }}
          sx={{
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            borderRadius: '16px',
            backgroundColor: 'transparent',
          }}
          MenuProps={{
            PaperProps: {
              elevation: 8,
              sx: {
                borderRadius: '12px',
                mt: 1,
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid rgba(63, 81, 181, 0.1)',
                maxHeight: 300,
                '& .MuiMenuItem-root': {
                  borderRadius: '8px',
                  margin: '4px 8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(63, 81, 181, 0.08)',
                    transform: 'translateX(4px)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(63, 81, 181, 0.12)',
                    '&:hover': {
                      backgroundColor: 'rgba(63, 81, 181, 0.16)',
                    }
                  }
                }
              }
            }
          }}
        >
          {languages.map((lang) => (
            <MenuItem 
              key={lang.code}
              value={lang.code}
              selected={i18n.language === lang.code}
              sx={{ 
                py: 1.5,
                px: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <ListItemIcon sx={{ minWidth: 'auto' }}>
                <Avatar
                  sx={{ 
                    width: 32, 
                    height: 32,
                    border: i18n.language === lang.code 
                      ? '3px solid #3f51b5' 
                      : '2px solid transparent',
                    transition: 'all 0.2s ease',
                    filter: i18n.language === lang.code 
                      ? 'brightness(1.1)' 
                      : 'brightness(0.9)',
                    '&:hover': {
                      filter: 'brightness(1.1)',
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  <img
                    src={flags[lang.flag]}
                    alt={lang.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                </Avatar>
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Typography 
                    sx={{ 
                      fontSize: '14px',
                      fontWeight: i18n.language === lang.code ? 700 : 500,
                      color: i18n.language === lang.code ? '#3f51b5' : '#1a1a1a',
                      transition: 'color 0.2s ease'
                    }}
                  >
                    {lang.name}
                  </Typography>
                }
                secondary={
                  <Typography 
                    sx={{ 
                      fontSize: '11px',
                      color: i18n.language === lang.code ? '#3f51b5' : '#666',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      mt: 0.2
                    }}
                  >
                    {lang.code}
                  </Typography>
                }
              />
              
              {i18n.language === lang.code && (
                <Chip 
                  label="Actuel" 
                  size="small" 
                  sx={{ 
                    backgroundColor: '#3f51b5', 
                    color: 'white',
                    fontSize: '10px',
                    height: '24px',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(63, 81, 181, 0.3)'
                  }} 
                />
              )}
            </MenuItem>
          ))}
          
          <Divider sx={{ my: 1, mx: 2, borderColor: 'rgba(63, 81, 181, 0.1)' }} />
          
          <Box sx={{ 
            px: 2, 
            py: 1, 
            textAlign: 'center',
            backgroundColor: 'rgba(63, 81, 181, 0.02)'
          }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#666',
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.5px'
              }}
            >
              Sélectionnez votre langue préférée
            </Typography>
          </Box>
        </Select>
      </FormControl>
      
      {/* Animation CSS pour l'effet pulse */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </Paper>
  );
};

export default T;
