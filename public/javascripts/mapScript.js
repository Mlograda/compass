// TO MAKE THE MAP APPEAR YOU MUST
// ADD YOUR ACCESS TOKEN FROM MAPBOX ACCOUNT
mapboxgl.accessToken = mapToken;


const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom


});

var nav = new mapboxgl.NavigationControl({ visualizePitch: true });
map.addControl(nav, 'top-right');

const marker = new mapboxgl.Marker({ color: '#f00' })
    .setLngLat(campground.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({ offset: 20, className: 'map-popup' })
        .setHTML(`<b>${campground.title}</b><p>${campground.location}</p>`))
    .addTo(map);
