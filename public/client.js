/* global L */

var map = L.map('map').setView([0, 0], 2)
L.esri.basemapLayer('Topographic').addTo(map)
// Instantiate the marker and marker events only one time when the map is first clicked
map.once('click', function (e) {
  updateLatLng(e.latlng)
  var marker = L.marker(e.latlng, {
    draggable: 'true',
    riseOnHover: 'true'
  }).addTo(map)
  marker.bindPopup('Your submission will appear here. You can drag the pin to correct the location.')
  marker.openPopup()
  map.on('click', function (e) {
   marker.setLatLng(e.latlng)
   marker.openPopup()
  })
  marker.on('move', function (e) {
     updateLatLng(e.latlng)
  })
  marker.on('moveend', function (e) {
     marker.openPopup()
  })
})                     

var latInput = document.getElementById('latitude')
var lngInput = document.getElementById('longitude')

function updateLatLng (latlng) {
  // Limit decimal places to six (any more is superfluous)
   latInput.value = Number(latlng.lat).toFixed(6)
   lngInput.value = Number(latlng.lng).toFixed(6)
}
