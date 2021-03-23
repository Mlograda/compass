
// TO MAKE THE MAP APPEAR YOU MUST
// ADD YOUR ACCESS TOKEN FROM MAPBOX ACCOUNT

mapboxgl.accessToken = mapToken;
var map = new mapboxgl.Map({
    container: 'cluster-map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-103.59179687498357, 40.66995747013945],
    zoom: 3
});
var nav = new mapboxgl.NavigationControl({ visualizePitch: true });
map.addControl(nav, 'top-right');

map.on('load', function() {

    map.addSource('campgrounds', {
        type: 'geojson',

        data: campgrounds, // DATA SOURCE
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        paint: {

            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#8BC34A',
                10,
                '#4CAF50',
                30,
                '#009688'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                15,
                10,
                25,
                30,
                30
            ]
        }
    });

    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',// calculates cluster cumulation 
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#11b4da',
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });

    // inspect a cluster on click
    map.on('click', 'clusters', function(e) {
        var features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        var clusterId = features[0].properties.cluster_id;
        map.getSource('campgrounds').getClusterExpansionZoom(
            clusterId,
            function(err, zoom) {
                if (err) return;

                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            }
        );
    });

    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    const popoup = new mapboxgl.Popup({ offset: [0, -20], className: 'Customize-popup', closeOnMove: true, maxWidth: '220px' })
    map.on('click', 'unclustered-point', function(e) {

        const text = e.features[0].properties.popup

        var coordinates = e.features[0].geometry.coordinates.slice();

        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        popoup.setLngLat(coordinates)
            .setHTML(
                text
            )
            .addTo(map);
    });

    map.on('mouseenter', 'clusters', function() {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', function() {
        map.getCanvas().style.cursor = '';
    });
});
