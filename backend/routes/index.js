const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Charger dynamiquement tous les fichiers de route du dossier `routes/`
fs.readdirSync(__dirname).forEach((file) => {
    if (file !== 'index.js' && file.endsWith('.js')) {
        const route = require(path.join(__dirname, file));
        router.use('/', route);
    }
});

module.exports = router;
