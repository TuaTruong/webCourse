console.log('Hello from the client site');
const locations = JSON.parse(
  document.getElementById('map').getAttribute('data-location')
);
console.log(locations);
