// Initialize the map
var map = L.map('map').setView([0, 0], 2);

// Add the base map layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

// Function to set the marker size based on magnitude and current zoom level
function getMarkerSize(magnitude, zoom) {
  // Scale the marker size based on magnitude and zoom level
  return Math.pow(magnitude, 1.5) * Math.pow(2, zoom) * 0.5;
}

// Function to set the marker color based on depth
function getMarkerColor(depth) {
  if (depth < 50) {
    return 'green';
  } else if (depth < 100) {
    return 'yellow';
  } else if (depth < 200) {
    return 'orange';
  } else {
    return 'red';
  }
}

// Function to create the marker popup content
function createPopup(feature) {
  return `<b>Location:</b> ${feature.properties.place}<br>
          <b>Magnitude:</b> ${feature.properties.mag}<br>
          <b>Depth:</b> ${feature.geometry.coordinates[2]} km`;
}

// Fetch earthquake data
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson')
  .then(function (data) {
    // Add markers for each earthquake
    data.features.forEach(feature => {
      var marker = L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
        radius: getMarkerSize(feature.properties.mag, map.getZoom()),
        fillColor: getMarkerColor(feature.geometry.coordinates[2]),
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map);

      // Add popup to marker
      marker.bindPopup(createPopup(feature));
    });

    // Add legend
    var legend = L.control({ position: 'bottomleft' });

    legend.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'legend');
      var legendContent = '<div class="legend-item"><div style="background-color: green"></div> <50 km</div>';
      legendContent += '<div class="legend-item"><div style="background-color: yellow"></div> 50-100 km</div>';
      legendContent += '<div class="legend-item"><div style="background-color: orange"></div> 100-200 km</div>';
      legendContent += '<div class="legend-item"><div style="background-color: red"></div> >200 km</div>';
      div.innerHTML = legendContent;
      return div;
    };

    legend.addTo(map);

    // Update marker size on map zoom
    map.on('zoomend', function () {
      data.features.forEach(feature => {
        var marker = feature.layer;
        marker.setRadius(getMarkerSize(feature.properties.mag, map.getZoom()));
      });
    });
  })
  .catch(function (error) {
    console.log('Error fetching earthquake data:', error);
  });
