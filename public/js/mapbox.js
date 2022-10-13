const locations = JSON.parse(
  document.getElementById('map').getAttribute('data-location')
);

mapboxgl.accessToken =
  'pk.eyJ1IjoiYWRtaW50dWFuMSIsImEiOiJjbDkwMzc1aHAwb3hnM25uNzNuNnV3ZzBpIn0.lmPrw78M2GLl1TsM9OjC_w';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
});
