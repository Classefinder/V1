// Coordonnées du lycée (centre du plan)
const lyceeCoords = [45.9368, 6.1322];
const proximityThreshold = 200; // Distance en kilomètres (50m)

// Fonction pour calculer la distance entre deux coordonnées
function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRad = x => (x * Math.PI) / 180;
    const R = 6371; // Rayon de la Terre en kilomètres

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance en kilomètres
}

// Initialiser la carte avec un fond OSM
function initializeBaseMap() {
    const map = L.map('map').setView(lyceeCoords, 16);

    // Ajouter un fond de carte OSM
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    return map;
}

// Définir les données GeoJSON pour chaque étage
const geojsonDataEtage0 = {
    type: "FeatureCollection",
    features: [
        { type: "Feature", properties: { salle: "13" }, geometry: { type: "Polygon", coordinates: [/* Coordonnées */] } }
    ]
};

const geojsonDataEtage1 = {
    type: "FeatureCollection",
    features: [
        { type: "Feature", properties: { salle: "117" }, geometry: { type: "Polygon", coordinates: [/* Coordonnées */] } }
    ]
};

// Initialiser la carte du lycée (avec les fonctionnalités spécifiques)
function initializeSchoolMap(map) {
    // Définir les calques pour chaque étage
    const fondsCartes = {
        "Étage 0": L.tileLayer('Tiles/LyceeLachenaletage0/{z}/{x}/{y}.png', { minZoom: 17, maxZoom: 22 }),
        "Étage 1": L.tileLayer('Tiles/LyceeLachenaletage1/{z}/{x}/{y}.png', { minZoom: 17, maxZoom: 22 })
    };

    // Créer les groupes de calques
    const layerEtage0 = L.layerGroup([fondsCartes["Étage 0"], L.geoJSON(geojsonDataEtage0)]);
    const layerEtage1 = L.layerGroup([fondsCartes["Étage 1"], L.geoJSON(geojsonDataEtage1)]);

    // Ajouter le calque initial (Étage 1 par défaut)
    layerEtage1.addTo(map);

    // Contrôle des calques
    L.control.layers(
        { "Étage 0": layerEtage0, "Étage 1": layerEtage1 },
        null,
        { collapsed: false }
    ).addTo(map);
}

// Gérer la géolocalisation
function handleGeolocation(map) {
    if (!navigator.geolocation) {
        alert("La géolocalisation n'est pas prise en charge par votre navigateur.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            const userCoords = [position.coords.latitude, position.coords.longitude];
            const distance = calculateDistance(
                userCoords[0], userCoords[1],
                lyceeCoords[0], lyceeCoords[1]
            );

            L.marker(userCoords).addTo(map).bindPopup("Vous êtes ici").openPopup();

            if (distance <= proximityThreshold) {
                initializeSchoolMap(map);
            } else {
                alert("Vous êtes hors de la zone requise. Approchez-vous du lycée pour voir le plan.");
            }
        },
        error => {
            console.error("Erreur de géolocalisation :", error);
            alert("Impossible d'obtenir votre localisation.");
        }
    );
}

// Initialisation au chargement
document.addEventListener("DOMContentLoaded", () => {
    const map = initializeBaseMap();
    handleGeolocation(map);
});
