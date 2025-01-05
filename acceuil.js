// Initialize the map
const map = L.map('map').setView([48.8566, 2.3522], 13); // Centered on Paris

// Add a tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var blueIcon = L.icon({
    iconUrl: './images/icon.png',
    shadowUrl: './images/ombreicon.png',

    iconSize:     [50, 59], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [25, 59], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -65] // point from which the popup should open relative to the iconAnchor
});


// Add some markers to the map
const markers = [
    { lat: 48.8566, lng: 2.3522, title: 'Parissssssssssssssssssssssssssssss', url: 'https://en.wikipedia.org/wiki/Paris' },
    { lat: 48.8584, lng: 2.2945, title: 'Eiffel Tower', url: 'https://en.wikipedia.org/wiki/Eiffel_Tower' },
    { lat: 48.8738, lng: 2.2950, title: 'Arc de Triomphe', url: 'lyceelachenal.html' },
    { lat: 48.606, lng: 2.3522, title: 'test', url: 'https://en.wikipedia.org/wiki/Paris' },
    { lat: 48.854, lng: 2.2945, title: '25', url: 'https://en.wikipedia.org/wiki/Eiffel_Tower' },
    { lat: 47.8738, lng: 2.2950, title: 'Eiffel Tower', url: 'lyceelachenal.html' }
];

const markerGroup = L.featureGroup();

markers.forEach(marker => {
    const markerItem = L.marker([marker.lat, marker.lng], {
        title: marker.title,
        icon: marker.icon || blueIcon
    }).bindPopup(
        `<div>
            <h3>${marker.title}</h3>
            <button onclick="window.location.href='${marker.url}'">More Info</button>
        </div>`
    );

    // Add properties for search compatibility
    markerItem.feature = {
        properties: {
            title: marker.title
        }
    };

    markerItem.addTo(markerGroup);
});

markerGroup.addTo(map);

// Add the search control to the map
const searchControl = new L.Control.Search({
    layer: markerGroup,
    propertyName: 'title',
    marker: false,
    collapsed: false,
    autocomplete: true,
    initial: false,
    textPlaceholder: 'Search locations...',
    moveToLocation: function (latlng, title, map) {
        map.setView(latlng, 15); // Zoom level after search
        const marker = markerGroup.getLayers().find(m => m.getLatLng().equals(latlng));
        if (marker) {
            marker.openPopup();
        }
    }
}).addTo(map);

// Move the search control to the sidebar
const searchBoxContainer = document.getElementById('searchBoxContainer');
const searchControlContainer = searchControl.getContainer();
searchBoxContainer.appendChild(searchControlContainer);

// Display all options in the tooltip
function showAllResults() {
    const records = {};
    markers.forEach(marker => {
        records[marker.title] = L.latLng(marker.lat, marker.lng);
    });
    searchControl.showTooltip('');
    searchControl._recordsCache = records; // Populate the records cache
}

// Trigger showing all results on focus
searchControl._input.onfocus = showAllResults;

// Show all results on page load
setTimeout(showAllResults, 100);
