// Coordonnées du lycée (centre du plan)
const lyceeCoords = [45.9368, 6.1322];
const proximityThreshold = 50; // Distance en kilomètres

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

// Vérifier la localisation de l'utilisateur
function checkLocationPermission() {
    if (!navigator.geolocation) {
        alert("La géolocalisation n'est pas prise en charge par votre navigateur.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            const userCoords = [position.coords.latitude, position.coords.longitude];
            const distance = calculateDistance(
                userCoords[0],
                userCoords[1],
                lyceeCoords[0],
                lyceeCoords[1]
            );

            if (distance <= proximityThreshold) {
                // Afficher la carte si l'utilisateur est proche
                initializeMap();
            } else {
                alert("Vous devez être à proximité du lycée pour afficher le plan.");
            }
        },
        error => {
            console.error("Erreur de géolocalisation :", error);
            alert("Impossible d'obtenir votre localisation. Veuillez autoriser la géolocalisation.");
        }
    );
}

// Initialiser la carte uniquement après vérification de la localisation
function initializeMap() {
    // Initialiser la carte
    var map = L.map('map', { zoomControl: true }).setView(lyceeCoords, 18);

    // Fonds de carte spécifiques à chaque étage
    var fondsCartes = {
        "Étage 0": L.tileLayer('http://89.168.57.91:8080/LyceeLachenaletage1/{z}/{x}/{y}.png', {
            minZoom: 17,
            maxZoom: 22,
        }),
        "Étage 1": L.tileLayer('http://89.168.57.91:8080/LyceeLachenaletage0/{z}/{x}/{y}.png', {
            minZoom: 17,
            maxZoom: 22,
        })
    };

    // Ajouter le fond de carte de l'étage 1 par défaut
    fondsCartes["Étage 1"].addTo(map);

    // (Reste de votre code de carte ici, inchangé)
    // Fonction de style par défaut
function getDefaultStyle() {
    return {
        color: "#FFDE26",
        weight: 2,
        opacity: 1,
        fillColor: "#FFF79F",
        fillOpacity: 0.7,
    };
}

// Définir les données GeoJSON pour chaque étage
var geojsonDataEtage2 = {
    "type": "FeatureCollection",
    "features": [
        { "type": "Feature", "properties": { "salle": "13" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 6.132443855592967, 45.936792791783791783532 ], [ 6.132451800410498, 45.936862076107261 ], [ 6.132332645198166, 45.936867696926917 ], [ 6.132323764318674, 45.936798784599809 ], [ 6.132443855592967, 45.936792791783532 ] ] ] ] } },
        { "type": "Feature", "properties": { "salle": "14" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 6.132323764318674, 45.93679878003244 ], [ 6.132332645193752, 45.936867696937178 ], [ 6.132169440848435, 45.936875476859768 ], [ 6.132160492656691, 45.936806544549889 ], [ 6.132323764318674, 45.93679878003244 ] ] ] ] } },
    ]
};

var geojsonDataEtage1 = {
    "type": "FeatureCollection",
    "features": [
        { "type": "Feature", "properties": { "salle": "117" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 6.132443855592967, 45.936792791783532 ], [ 6.132451800410498, 45.936862076107261 ], [ 6.132332645198166, 45.936867696926917 ], [ 6.132323764318674, 45.936798784599809 ], [ 6.132443855592967, 45.936792791783532 ] ] ] ] } },
        { "type": "Feature", "properties": { "salle": "115" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 6.132323764318674, 45.93679878003244 ], [ 6.132332645193752, 45.936867696937178 ], [ 6.132169440848435, 45.936875476859768 ], [ 6.132160492656691, 45.936806544549889 ], [ 6.132323764318674, 45.93679878003244 ] ] ] ] } },
    ]
};

// Variables pour les calques
var layerEtage1, layerEtage2;

// Fonction pour créer les calques GeoJSON
function createLayer(geojsonData) {
    return L.geoJSON(geojsonData, {
        style: getDefaultStyle,
        onEachFeature: onEachFeature
    });
}

// Initialiser les calques
layerEtage1 = createLayer(geojsonDataEtage1);
layerEtage2 = createLayer(geojsonDataEtage2);

// Ajouter uniquement l'étage 1 au chargement
layerEtage1.addTo(map);

// Gestionnaire des couches (calques de base)
var baseMaps = {
    "Étage 0": layerEtage1,
    "Étage 1": layerEtage2
};

L.control.layers(baseMaps, null, { collapsed: false }).addTo(map);

// Fonction d'interaction pour les GeoJSON
function onEachFeature(feature, layer) {
    if (feature.properties.salle !== null) {
        var tooltip = L.tooltip({
            permanent: true,
            direction: "center",
            className: "leaflet-tooltip-custom"
        }).setContent(feature.properties.salle);

        layer.bindTooltip(tooltip);
    }

    layer.on({
        mouseover: function(e) {
            e.target.setStyle({ fillColor: "#FFF36F", color: "#FFDE26", fillOpacity: 0.99 });
        },
        mouseout: function(e) {
            e.target.setStyle(getDefaultStyle());
        },
        click: function(e) {
            map.fitBounds(e.target.getBounds());
        }
    });
}

// Gestion des calques et changement de fond de carte
map.on('baselayerchange', function(e) {
    // Supprimer tous les fonds de carte
    Object.values(fondsCartes).forEach(function(tileLayer) {
        map.removeLayer(tileLayer);
    });

    // Ajouter le fond de carte correspondant au calque actif
    fondsCartes[e.name].addTo(map);

    // Gérer l'affichage des calques (optionnel si déjà géré)
    if (e.name === "Étage 0") {
        layerEtage2.remove();
        layerEtage1.addTo(map);
    } else if (e.name === "Étage 1") {
        layerEtage1.remove();
        layerEtage2.addTo(map);
    }
});

// Gestion des labels en fonction du zoom
function updateLabels() {
    var currentZoom = map.getZoom();
    var showLabels = currentZoom >= 20;

    [layerEtage1, layerEtage2].forEach(function(layer) {
        layer.eachLayer(function(subLayer) {
            if (subLayer.getTooltip()) {
                if (showLabels && subLayer.feature.properties.salle !== null) { // Affiche uniquement si la salle n'est pas null
                    subLayer.openTooltip();
                } else {
                    subLayer.closeTooltip();
                }
            }
        });
    });
}

map.on('zoomend', updateLabels);

// Fonction d'interaction pour les GeoJSON
function onEachFeature(feature, layer) {
    // Ne pas ajouter de tooltip si la salle est null
    if (feature.properties.salle !== null) {
        var tooltip = L.tooltip({
            permanent: true,
            direction: "center",
            className: "leaflet-tooltip-custom"
        }).setContent(feature.properties.salle);

        layer.bindTooltip(tooltip);
    }

    layer.on({
        mouseover: function(e) {
            e.target.setStyle({ fillColor: "#FFF36F", color: "#FFDE26", fillOpacity: 0.99 });
        },
        mouseout: function(e) {
            e.target.setStyle(getDefaultStyle());
        },
        click: function(e) {
            map.fitBounds(e.target.getBounds());
        }
    });
}

// Gestion des calques : n'afficher qu'un seul calque actif
map.on('baselayerchange', function(e) {
    if (e.name === "Étage 0") {
        layerEtage2.remove();
        layerEtage1.addTo(map);
    } else if (e.name === "1") {
        layerEtage1.remove();
        layerEtage2.addTo(map);
    }
    updateLabels();
});

var activeLayer = layerEtage1; // Calque actif initialisé à l'étage 1

// Fonction pour mettre en surbrillance les résultats
function highlightResults(results, bounds) {791783
    results.forEach(function(layer) {
        layer.setStyle({
            color: "#eab308",
            fillColor: "#facc15",
            fillOpacity: 0.7,
            weight: 3
        });

        setTimeout(function() {
            layer.setStyle(getDefaultStyle());
        }, 3000);

        bounds.extend(layer.getBounds());
    });
}

// Mettre à jour activeLayer lorsque le calque change
map.on('layeradd', function(e) {
    if (e.layer === layerEtage1) {
        activeLayer = layerEtage1;
    } else if (e.layer === layerEtage2) {
        activeLayer = layerEtage2;
    }
});

// Barre de recherche
var searchControl = new L.Control.Search({
    layer: L.layerGroup([layerEtage1, layerEtage2]), // Groupement des calques
    propertyName: 'salle',
    initial: false,
    collapsed: false,
    position: 'topright',
    zoom: 21,
    marker: false,
    autocomplete: true,
    moveToLocation: function(latlng, title, map) {
        var foundLayers = [];
        var bounds = L.latLngBounds();

        // Étape 1 : Recherche uniquement sur le calque actif
        activeLayer.eachLayer(function(subLayer) {
            if (subLayer.feature && subLayer.feature.properties.salle === title) {
                foundLayers.push(subLayer);
                bounds.extend(subLayer.getBounds());
            }
        });

        // Si des résultats sont trouvés sur le calque actif
        if (foundLayers.length > 0) {
            highlightResults(foundLayers, bounds);

            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [20, 20] });
            }
            return;
        }

        // Étape 2 : Recherche globale uniquement si aucun résultat n'a été trouvé sur le calque actif
        var globalFoundLayers = [];
        var globalBounds = L.latLngBounds();
        var targetLayer = null;

        [layerEtage1, layerEtage2].forEach(function(layer) {
            if (layer !== activeLayer) { // Ne pas re-rechercher dans le calque actif
                layer.eachLayer(function(subLayer) {
                    if (subLayer.feature && subLayer.feature.properties.salle === title) {
                        globalFoundLayers.push(subLayer);
                        globalBounds.extend(subLayer.getBounds());
                        targetLayer = layer;
                    }
                });
            }
        });

        if (globalFoundLayers.length > 0) {
            // Changer de calque uniquement si le résultat est trouvé dans un autre calque
            if (targetLayer && targetLayer !== activeLayer) {
                map.eachLayer(function(layer) {
                    if (layer instanceof L.GeoJSON) {
                        layer.remove();
                    }
                });
                targetLayer.addTo(map);
                activeLayer = targetLayer;
            }

            // Surligner les résultats et ajuster la vue
            highlightResults(globalFoundLayers, globalBounds);

            if (globalBounds.isValid()) {
                map.fitBounds(globalBounds, { padding: [20, 20] });
            }
        }
    }
});

map.addControl(searchControl);
document.querySelector('.leaflet-control-search input').placeholder = "Rechercher...";

// Mettre à jour les labels au chargement
updateLabels();

}

// Vérifier la localisation au chargement de la page
document.addEventListener("DOMContentLoaded", checkLocationPermission);

