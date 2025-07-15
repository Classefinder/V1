// Serveur Express pour servir les fichiers GeoJSON de façon sécurisée
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3001; // Port du serveur

// Dossier où sont stockés les fichiers GeoJSON (à adapter si besoin)
const geojsonDir = path.join(__dirname, '../Données/JOSM');

// Middleware simple d'authentification (à améliorer selon besoin)
app.use((req, res, next) => {
    // Exemple : autoriser tout le monde (à remplacer par une vraie auth si besoin)
    next();
});

// Route pour servir un fichier GeoJSON spécifique
app.get('/geojson/:filename', (req, res) => {
    const { filename } = req.params;
    // Sécurité : n'autorise que les fichiers .geojson
    if (!filename.endsWith('.geojson')) {
        return res.status(400).send('Fichier non autorisé');
    }
    const filePath = path.join(geojsonDir, filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('Fichier introuvable');
    }
    res.sendFile(filePath);
});

app.listen(PORT, () => {
    console.log(`Serveur GeoJSON sécurisé démarré sur http://localhost:${PORT}`);
});
