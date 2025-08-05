import React, { useState } from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Paper,
  Avatar
} from '@mui/material';
import flags from '../flags';
import T from './T';

const LanguageExportSelector = ({ onLanguageChange, defaultLang = 'fr', size = 'medium' }) => {
  const [selectedLang, setSelectedLang] = useState(defaultLang);

  const languages = [
    { code: 'fr', name: 'Français', flag: 'FR' },
    { code: 'en', name: 'English', flag: 'GB' },
    { code: 'es', name: 'Español', flag: 'ES' },
    { code: 'de', name: 'Deutsch', flag: 'DE' },
    { code: 'it', name: 'Italiano', flag: 'IT' },
    { code: 'pt', name: 'Português', flag: 'PT' }
  ];

  const handleChange = (event) => {
    const newLang = event.target.value;
    setSelectedLang(newLang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  const isSmall = size === 'small';

  return (
    <Paper 
      elevation={1}
      sx={{ 
        borderRadius: isSmall ? '8px' : '12px',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid rgba(25, 118, 210, 0.1)',
        display: 'inline-block'
      }}
    >
      <Box sx={{ p: isSmall ? 1 : 1.5 }}>
        <Typography 
          variant={isSmall ? "caption" : "body2"} 
          sx={{ 
            mb: 1, 
            color: '#666',
            fontWeight: 500,
            fontSize: isSmall ? '10px' : '12px'
          }}
        >
          <T>Langue du rapport :</T>
        </Typography>
        
        <FormControl variant="outlined" size={isSmall ? "small" : "medium"} sx={{ minWidth: isSmall ? 120 : 160 }}>
          <Select
            value={selectedLang}
            onChange={handleChange}
            renderValue={(selected) => {
              const lang = languages.find(l => l.code === selected) || languages[0];
              return (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1
                }}>
                  <Avatar
                    sx={{ 
                      width: isSmall ? 20 : 24, 
                      height: isSmall ? 20 : 24,
                      border: '1px solid #1976d2'
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
                  <Typography 
                    sx={{ 
                      fontSize: isSmall ? '12px' : '14px', 
                      fontWeight: 500,
                      color: '#1976d2'
                    }}
                  >
                    {lang.name}
                  </Typography>
                </Box>
              );
            }}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(25, 118, 210, 0.2)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(25, 118, 210, 0.4)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1976d2',
              },
              borderRadius: isSmall ? '6px' : '8px',
            }}
          >
            {languages.map((lang) => (
              <MenuItem 
                key={lang.code}
                value={lang.code}
                sx={{ 
                  py: 1,
                  px: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5
                }}
              >
                <Avatar
                  sx={{ 
                    width: isSmall ? 20 : 24, 
                    height: isSmall ? 20 : 24,
                    border: selectedLang === lang.code 
                      ? '2px solid #1976d2' 
                      : '1px solid transparent'
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
                <Typography 
                  sx={{ 
                    fontSize: isSmall ? '12px' : '14px',
                    fontWeight: selectedLang === lang.code ? 600 : 400,
                    color: selectedLang === lang.code ? '#1976d2' : '#333'
                  }}
                >
                  {lang.name}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};

export default LanguageExportSelector;
