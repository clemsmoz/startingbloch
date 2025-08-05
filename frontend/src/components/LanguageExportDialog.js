import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Avatar,
  Typography,
  Divider,
  Paper,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import flags from '../flags';
import T from './T';

const LanguageExportDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  title = "Sélectionner la langue d'export" 
}) => {
  const { i18n } = useTranslation();
  const theme = useTheme();
  
  // Utiliser la langue actuelle de l'interface comme valeur par défaut
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'fr');

  const languages = [
    { code: 'fr', name: 'Français', flag: 'FR' },
    { code: 'en', name: 'English', flag: 'GB' },
    { code: 'es', name: 'Español', flag: 'ES' },
    { code: 'de', name: 'Deutsch', flag: 'DE' },
    { code: 'it', name: 'Italiano', flag: 'IT' },
    { code: 'pt', name: 'Português', flag: 'PT' }
  ];

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  const handleConfirm = () => {
    onConfirm(selectedLanguage);
    onClose();
  };

  const handleCancel = () => {
    // Réinitialiser à la langue de l'interface
    setSelectedLanguage(i18n.language || 'fr');
    onClose();
  };

  // Synchroniser avec les changements de langue de l'interface
  React.useEffect(() => {
    setSelectedLanguage(i18n.language || 'fr');
  }, [i18n.language]);

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: theme.shadows[8]
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        fontSize: '1.25rem',
        fontWeight: 600,
        color: theme.palette.primary.main
      }}>
        <T>{title}</T>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <FormControl component="fieldset" fullWidth>
          <FormLabel 
            component="legend" 
            sx={{ 
              mb: 2,
              fontSize: '0.95rem',
              fontWeight: 500,
              color: theme.palette.text.primary
            }}
          >
            <T>Choisissez la langue pour l'export PDF :</T>
          </FormLabel>
          
          <RadioGroup
            value={selectedLanguage}
            onChange={handleLanguageChange}
            sx={{ gap: 1 }}
          >
            {languages.map((lang) => (
              <Paper
                key={lang.code}
                elevation={selectedLanguage === lang.code ? 2 : 0}
                sx={{
                  border: selectedLanguage === lang.code 
                    ? `2px solid ${theme.palette.primary.main}` 
                    : `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    elevation: 1,
                    borderColor: theme.palette.primary.light
                  }
                }}
              >
                <FormControlLabel
                  value={lang.code}
                  control={
                    <Radio 
                      sx={{ 
                        color: theme.palette.primary.main,
                        '&.Mui-checked': {
                          color: theme.palette.primary.main
                        }
                      }} 
                    />
                  }
                  label={
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      py: 1,
                      width: '100%'
                    }}>
                      <Avatar
                        sx={{ 
                          width: 32, 
                          height: 32,
                          border: selectedLanguage === lang.code 
                            ? `2px solid ${theme.palette.primary.main}` 
                            : `1px solid ${theme.palette.divider}`,
                          transition: 'all 0.2s ease'
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
                      
                      <Box>
                        <Typography 
                          sx={{ 
                            fontSize: '1rem',
                            fontWeight: selectedLanguage === lang.code ? 600 : 500,
                            color: selectedLanguage === lang.code 
                              ? theme.palette.primary.main 
                              : theme.palette.text.primary
                          }}
                        >
                          {lang.name}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: theme.palette.text.secondary,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {lang.code}
                        </Typography>
                      </Box>

                      {selectedLanguage === lang.code && (
                        <Box sx={{ ml: 'auto' }}>
                          <Typography
                            variant="caption"
                            sx={{
                              backgroundColor: theme.palette.primary.main,
                              color: 'white',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                          >
                            <T>Sélectionnée</T>
                          </Typography>
                        </Box>
                      )}

                      {i18n.language === lang.code && (
                        <Box sx={{ ml: selectedLanguage === lang.code ? 0 : 'auto' }}>
                          <Typography
                            variant="caption"
                            sx={{
                              backgroundColor: theme.palette.success.main,
                              color: 'white',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                          >
                            <T>Interface actuelle</T>
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  }
                  sx={{ 
                    margin: 0,
                    width: '100%',
                    px: 2,
                    py: 1
                  }}
                />
              </Paper>
            ))}
          </RadioGroup>

          <Box sx={{ mt: 2, p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              <T>💡 Conseil : La langue de l'interface est sélectionnée par défaut. Vous pouvez choisir une langue différente pour l'export PDF.</T>
            </Typography>
          </Box>
        </FormControl>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button 
          onClick={handleCancel}
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          <T>Annuler</T>
        </Button>
        <Button 
          onClick={handleConfirm}
          variant="contained"
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3
          }}
        >
          <T>Exporter en {languages.find(l => l.code === selectedLanguage)?.name || 'Français'}</T>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LanguageExportDialog;
