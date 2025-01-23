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

            // Ajouter un marqueur pour la position de l'utilisateur
            const userMarker = L.marker(userCoords).addTo(map).bindPopup("Vous êtes ici").openPopup();

            if (distance <= proximityThreshold) {
                // Utilisateur dans la zone, afficher le plan
                initializeSchoolMap(map, userMarker, userCoords);
            } else {
                // Ajouter un cercle pour montrer la zone requise
                L.circle(lyceeCoords, {
                    radius: proximityThreshold * 1000,
                    color: 'red',
                    fillOpacity: 0.1
                }).addTo(map);

                alert("Vous êtes hors de la zone requise. Approchez-vous du lycée pour voir le plan.");
            }
        },
        error => {
            console.error("Erreur de géolocalisation :", error);
            alert("Impossible d'obtenir votre localisation. Veuillez autoriser la géolocalisation.");
        }
    );
}






// Initialiser la carte du lycée (avec les fonctionnalités spécifiques)
function initializeSchoolMap(map, userMarker, userCoords) {
// Fonds de carte spécifiques à chaque étage
var fondsCartes = {
    "Étage 1": L.tileLayer('Tiles/LyceeLachenaletage1/{z}/{x}/{y}.png', {
        minZoom: 17,
        maxZoom: 22,
    }),
    "Étage 0": L.tileLayer('Tiles/LyceeLachenaletage0/{z}/{x}/{y}.png', {
        minZoom: 17,
        maxZoom: 22,
    })
};

// Ajouter le fond de carte de l'étage 1 par défaut
fondsCartes["Étage 1"].addTo(map);

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
          
    
        { "type": "Feature", "properties": { "salle": "117" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 6.132443855592967, 45.936792791783532 ], [ 6.132451800410498, 45.936862076107261 ], [ 6.132332645198166, 45.936867696926917 ], [ 6.132323764318674, 45.936798784599809 ], [ 6.132443855592967, 45.936792791783532 ] ] ] ] } },
    ]
};

var geojsonDataEtage1 = {
    "type": "FeatureCollection",
    "features": [
        { "type": "Feature", "properties": { "salle": "13" }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 6.132443855592967, 45.936792791783532 ], [ 6.132451800410498, 45.936862076107261 ], [ 6.132332645198166, 45.936867696926917 ], [ 6.132323764318674, 45.936798784599809 ], [ 6.132443855592967, 45.936792791783532 ] ] ] ] } },
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

    // Variables pour stocker les points de départ et d'arrivée pour l'itinéraire
    var startPoint = null;
    var endPoint = null;

    // Couches GeoJSON pour l'itinéraire avec styles personnalisés
    var routeLayerEtage0 = L.geoJSON(null, {
        style: { color: "red", weight: 4 }
    });

    var routeLayerEtage1 = L.geoJSON(null, {
        style: { color: "blue", weight: 4 }
    });
    routeLayerEtage0.addTo(map);
    routeLayerEtage1.addTo(map);

    // Contrôle des calques pour l'itinéraire
    var overlayRouteLayers = {
        "étage0": routeLayerEtage0,
        "étage1": routeLayerEtage1
    };


    //Ajouter les calques d'itinéraires au controle des calques existant
    L.control.layers(baseMaps, overlayRouteLayers, { collapsed: false }).addTo(map);

    function getRouteAndPoints(start, end) {
        var osrmUrl = "http://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?steps=true&geometries=geojson&overview=full";

        fetch(osrmUrl)
            .then(response => response.json())
            .then(data => {
                if (data.routes && data.routes.length > 0) {
                    var route = data.routes[0];

                    routeLayerEtage0.clearLayers();
                    routeLayerEtage1.clearLayers();

                    route.legs[0].steps.forEach((step, index) => {
                        var startName = step.name || "";
                        var endName = (route.legs[0].steps[index + 1] || {}).name || "";
                        var segment = {
                            type: "Feature",
                            geometry: {
                                type: "LineString",
                                coordinates: step.geometry.coordinates
                            },
                            properties: {
                                name: startName
                            }
                        };

                        if (startName.toLowerCase().includes("de") || endName.toLowerCase().includes("de")) {
                            routeLayerEtage0.addData(segment);
                        }
                        if (startName.toLowerCase().includes("s") || endName.toLowerCase().includes("s")) {
                            routeLayerEtage1.addData(segment);
                        }
                    });

                    var bounds = L.geoJSON(route.geometry).getBounds();
                    map.fitBounds(bounds);
                }
            })
            .catch(error => {
                console.error('Erreur lors de la récupération de l\'itinéraire:', error);
            });
    }

    // Gestion des clics pour l'itinéraire (uniquement si l'utilisateur est dans la zone)
    map.on('click', function(event) {
        if (calculateDistance(userCoords[0], userCoords[1], lyceeCoords[0], lyceeCoords[1]) <= proximityThreshold) {
            if (!startPoint) {
                startPoint = [event.latlng.lat, event.latlng.lng];
                L.marker(startPoint).addTo(map).bindPopup("Point de départ").openPopup();
            } else if (!endPoint) {
                endPoint = [event.latlng.lat, event.latlng.lng];
                L.marker(endPoint).addTo(map).bindPopup("Point d'arrivée").openPopup();
                getRouteAndPoints(startPoint, endPoint);
            } else {
                startPoint = null;
                endPoint = null;
                map.eachLayer(function(layer) {
                    if (layer instanceof L.Marker && layer !== userMarker) { // Exclure le marqueur utilisateur
                        map.removeLayer(layer);
                    }
                    if (layer === routeLayerEtage0 || layer === routeLayerEtage1) {
                        layer.clearLayers();
                    }
                });
            }
        }
    });

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

// Initialisation au chargement
document.addEventListener("DOMContentLoaded", () => {
    const map = initializeBaseMap();
    handleGeolocation(map);
});