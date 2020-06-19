/**
 * Created by mendt on 18.02.16.
 */
goog.provide('vk2.module.MapModule');

goog.require('vk2.control.FlipViewMode');
goog.require('vk2.control.LayerSpy');
goog.require('vk2.control.MousePositionOnOff');
goog.require('vk2.control.Permalink');
goog.require('vk2.control.RotateNorth');
goog.require('vk2.layer.HistoricMap');
goog.require('vk2.layer.HistoricMap3D');
goog.require('vk2.module.MapSearchModuleEventType');
goog.require('vk2.settings');
goog.require('vk2.utils');
goog.require('vk2.utils.Modal');
goog.require('vk2.utils.routing');

/**
 * Extend the ol.Map object. Zooms to a given point. This function is also used by the permalink tool
 *
 * @param {ol.Coordinate} center
 * @param {number} zoom
 */
ol.Map.prototype.zoomTo = function(center, zoom) {
    this.getView().setCenter(center);
    this.getView().setZoom(zoom);
};

/**
 * @returns {Array.<vk2.layer.HistoricMap>}
 */
ol.Map.prototype.getHistoricMapLayer = function(){
    var layers = this.getLayers().getArray();
    var historicMapLayers = [];
    for (var i = 0; i < layers.length; i++){
        if (vk2.utils.is3DMode()) {
            if (layers[i] instanceof vk2.layer.HistoricMap3D){
                historicMapLayers.push(layers[i]);
            };
        } else {
            if (layers[i] instanceof vk2.layer.HistoricMap){
                historicMapLayers.push(layers[i]);
            };
        }
    };
    return historicMapLayers;
};

/**
 * @param {string} mapElId
 * @param {Object|undefined} opt_mapViewSettings
 * @param {boolean|undefined} opt_terrain Parameter defines if 3d should be active
 * @constructor
 * @export
 */
vk2.module.MapModule = function(mapElId, opt_mapViewSettings, opt_terrain){

    var mapViewSettings = opt_mapViewSettings !== undefined ? opt_mapViewSettings : {
        projection: 'EPSG:3857',
        center: [1528150, 6630500],
        zoom: 2
    };

    var controls = [
        new ol.control.Attribution({
            collapsible:false,
            collapsed:false
        }),
        new ol.control.Zoom(),
        new ol.control.FullScreen(),
        new vk2.control.RotateNorth(),
        new ol.control.ScaleLine(),
        new vk2.control.Permalink(),
        new vk2.control.MousePositionOnOff()
    ];

    // append layerspy only in case 3d mode is not active
    if (!goog.isDef(opt_terrain) || opt_terrain === false) {
        controls.push(new vk2.control.LayerSpy({
            'spyLayer':new ol.layer.Tile({
                attribution: undefined,
                source: new ol.source.XYZ({
                    'urls': vk2.settings.OSM_URLS,
                    'crossOrigin': '*',
                    'attributions': []
                })
            })
        }));
    };

    // create attribution
    var attribution = [
        new ol.Attribution({
            html: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        })
    ];

    if (goog.isDef(opt_terrain) && opt_terrain === true) {
        attribution.push(new ol.Attribution({
            html: '<a href="https://cesiumjs.org/data-and-assets/terrain/stk-world-terrain.html">© Analytical Graphics, Inc., © CGIAR-CSI, ' +
                'Produced using Copernicus data and information funded by the European Union - EU-DEM layers, ' +
                ' © Commonwealth of Australia (Geoscience Australia) 2012</a>'
        }));
    };

    /**
     * @type {ol.Map}
     * @private
     */
    this.map_ =  new ol.Map({
        'layers': [
            new ol.layer.Tile({
                //source: new ol.source.OSM()
                source: new ol.source.XYZ({
                    'urls': vk2.settings.OSM_URLS,
                    'crossOrigin': '*',
                    'attributions': attribution,
                    'maxZoom': 18
                })
            })
        ],
        'renderer': 'canvas',
        'target': mapElId,
        'interactions': ol.interaction.defaults().extend([
            new ol.interaction.DragRotateAndZoom()
        ]),
        'controls': controls,
        'view': new ol.View(mapViewSettings)
    });

    if (vk2.settings.MODE_3D === true && goog.isDef(opt_terrain) && opt_terrain === true) {

        //
        // Some code regarding the 3d capabilities is based on the work of https://github.com/geoadmin/mf-geoadmin3
        //

        //// initialize the globe
        var ol3d = new olcs.OLCesium({
            'map': this.map_,
            'sceneOptions': {
                'terrainExaggeration' : 2.0
            }
        });
        ol3d.enableAutoRenderLoop();

        // initialize a terrain map
        var scene = ol3d.getCesiumScene(),
            globe = scene.globe,
            camera = scene.camera;

        // set this global because it is used by other application code
        window['ol3d'] = ol3d;

        // some test code
        var tileCacheSize = '100',
            // The maximum screen-space error used to drive level-of-detail refinement. Higher values will provide better performance but lower visual quality.
            // Default is 2
            maximumScreenSpaceError = 1.5,
            fogEnabled = true,
            fogDensity = 0.000003880708760225126 * 20,
            fogSseFactor = 25 * 2;

        window['minimumRetrievingLevel'] = 8;
        window['imageryAvailableLevels'] = undefined;

        globe['baseColor'] = Cesium.Color.WHITE;
        globe['tileCacheSize'] = tileCacheSize;
        globe['maximumScreenSpaceError'] = maximumScreenSpaceError;
        scene.backgroundColor = Cesium.Color.WHITE;
        scene.globe.depthTestAgainstTerrain = true;
        scene.screenSpaceCameraController.maximumZoomDistance = 300000; //4000000;
        scene.terrainProvider = new Cesium.CesiumTerrainProvider({
            'url' : vk2.settings.TERRAIN_TILES_URL,
            'requestVertexNormals' : true
        });
        scene.fog.enabled = fogEnabled;
        scene.fog.density = fogDensity;
        scene.fog.screenSpaceErrorFactor = fogSseFactor;
        scene.scene3DOnly = true;

        var extent4326 = ol.proj.transformExtent(mapViewSettings.extent, mapViewSettings.projection, 'EPSG:4326')
                .map(function(angle) {
                    return angle * Math.PI / 180;
                });
        var limitCamera = function() {
            var pos = camera.positionCartographic.clone();
            var inside = ol.extent.containsXY(extent4326, pos.longitude, pos.latitude);
            if (!inside) {
                // add a padding based on the camera height
                var maxHeight = this.screenSpaceCameraController.maximumZoomDistance;
                var padding = pos.height * 0.05 / maxHeight;
                pos.longitude = Math.max(extent4326[0] - padding, pos.longitude);
                pos.latitude = Math.max(extent4326[1] - padding, pos.latitude);
                pos.longitude = Math.min(extent4326[2] + padding, pos.longitude);
                pos.latitude = Math.min(extent4326[3] + padding, pos.latitude);
                this.camera.setView({
                    destination: Cesium.Ellipsoid.WGS84.cartographicToCartesian(pos),
                    orientation: {
                        heading: this.camera.heading,
                        pitch: this.camera.pitch
                    }
                });
            }
            // Set the minimumZoomDistance according to the camera height
            var minimumZoomDistance = pos.height > 1800 ? 400 : 200;
            this.screenSpaceCameraController.minimumZoomDistance = minimumZoomDistance;
        };
        scene.postRender.addEventListener(limitCamera, scene);

        // together with the "requestVertexNormals" flag (see terrainProvider) it enables the displaying
        // of shadows on the map,
        //scene.globe.enableLighting = true;
        //scene.globe.lightingFadeInDistance = 1000000000;
        //scene.globe.lightingFadeOutDistance = 10000000;

        // append / update controls if application is initialize in 3d mode
        var uri = new goog.Uri(window.location.href),
            params = uri.getQueryData(),
            flipControl = new vk2.control.FlipViewMode();

        if (params.containsKey('pos'))
            flipControl.switchControlMode('3d');

        this.map_.addControl(flipControl);
    };

    // append click behavior to map object
    this.map_.on('singleclick', function(event){
        if (goog.DEBUG)
            console.log('Pixel: '+event.pixel);

        var features = [];
        if (vk2.utils.is3DMode()) {
            // special behavior for mode 3d
            var clickCoordinate = this.map_.getCoordinateFromPixel(event.pixel);
            features = this.historicMapClickLayer_.getSource().getFeaturesAtCoordinate(clickCoordinate);
        } else {
            this.getMap().forEachFeatureAtPixel(event['pixel'], function(feature){
                features.push(feature);
            });
        }

        if (goog.DEBUG)
            console.log(features);

        vk2.module.MapModule.showMapProfile(features);
    }, this);


};

/**
 * Checks if the layer collection already contains a layer with that id.
 *
 * @param {string} id
 * @param {ol.Collection} layers
 * @return {boolean}
 */
vk2.module.MapModule.containsLayerWithId = function(id, layers) {
    var array = layers.getArray();
    for (var i = 0; i < array.length; i++) {
        if (array[i] instanceof vk2.layer.HistoricMap || array[i] instanceof vk2.layer.HistoricMap3D) {
            if (array[i].getId() == id) {
                return true;
            }
        }
    }
    return false;
};

/**
 * @param {ol.Feature} feature
 * @return {vk2.layer.HistoricMap}
 * @private
 */
vk2.module.MapModule.prototype.createHistoricMapForFeature_ = function(feature){
    var maxZoom = feature.get('denominator') == 0
            ? 15 : feature.get('denominator') <= 5000
                ? 17 : feature.get('denominator') <= 15000
                    ? 16 : 15;
    return vk2.settings.MODE_3D && window['ol3d'] !== undefined ?
        new vk2.layer.HistoricMap3D({
            'maxZoom': maxZoom,
            'time':feature.get('time'),
            'thumbnail': feature.get('thumb'),
            'title': feature.get('title'),
            'objectid': feature.get('id'),
            'id': feature.getId(),
            'dataid':feature.get('dataid'),
            'tms': feature.get('tms'),
            'clip': feature.getGeometry().clone()
        }, this.map_) :
        new vk2.layer.HistoricMap({
            'time':feature.get('time'),
            'maxZoom': maxZoom,
            'thumbnail': feature.get('thumb'),
            'title': feature.get('title'),
            'objectid': feature.get('id'),
            'id': feature.getId(),
            'dataid':feature.get('dataid'),
            'tms': feature.get('tms'),
            'clip': feature.getGeometry().clone()
    }, this.map_);
};

/**
 * @returns {ol.Map}
 * @export
 */
vk2.module.MapModule.prototype.getMap = function(){
    return this.map_;
};

/**
 * @param {vk2.tool.Permalink} permalink
 */
vk2.module.MapModule.prototype.registerPermalinkTool = function(permalink){
    // couple permalink module with map
    goog.events.listen(permalink, vk2.tool.PermalinkEventType.ADDMAP, function(event){
        var feature = event.target['feature'];

        // request associated messtischblaetter for a blattnr
        if (feature.get('georeference') === true) {
            this.map_.addLayer(this.createHistoricMapForFeature_(feature));

            if (vk2.utils.is3DMode()) {
                // add vector geometry for the given historic map to a special layer for simulate 3d mode experience
                var feature = vk2.layer.HistoricMap.createClipFeature(feature.getGeometry().clone(), feature.getId(),
                    feature.get('time'), feature.get('title'))
                this.historicMapClickLayer_.getSource().addFeature(feature);
            };
        }
    }, undefined, this);

    // parse permalink if one exists
    permalink.parsePermalink(this.map_);
};


/**
 * @param {vk2.module.SpatialTemporalSearchModule} spatialTemporalSearchModule
 */
vk2.module.MapModule.prototype.registerSpatialTemporalSearch = function(spatialTemporalSearchModule){

    /**
     * @type {vk2.module.MapSearchModule}
     * @private
     */
    this.mapsearch_ = spatialTemporalSearchModule.getMapSearchModule();

    //
    // Initialize an historic map click layer which is only used in case of 3d mode
    //

    /**
     * @type {ol.layer.Vector|undefined}
     * @private
     */
    this.historicMapClickLayer_ = vk2.utils.is3DMode() ? new ol.layer.Vector({
            'source': new ol.source.Vector(),
            'style': function(feature, resolution) {
                return [new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.0)'
                    })
                })];
            }
        }) : undefined;

    if (this.historicMapClickLayer_ !== undefined) {
        // in case 3d mode is active add altitude value to coordinate
        this.historicMapClickLayer_.set('altitudeMode', 'clampToGround');
        this.historicMapClickLayer_.set('type', 'click');

        // hold the overlay layer on top of the historic map layers
        this.map_.getLayers().on('add', function(event) {
            var topLayer = event.target.getArray()[event.target.getLength() - 1];
            if (topLayer instanceof vk2.layer.HistoricMap || topLayer instanceof vk2.layer.HistoricMap3D) {
                this.map_.removeLayer(this.historicMapClickLayer_);
                this.map_.addLayer(this.historicMapClickLayer_);
            }
        }, this);

        this.map_.addLayer(this.historicMapClickLayer_);
    };

    // register event listener
    goog.events.listen(this.mapsearch_, vk2.module.MapSearchModuleEventType.CLICK_RECORD, function(event){
        var feature = event.target['feature'];

        // checks if a layer for this features is already present
        if (vk2.module.MapModule.containsLayerWithId(feature.getId(), this.map_.getLayers())) {
            if (goog.DEBUG) {
                console.log('Map is already displayed');
            }

            return;
        }


        // add layer to map
        if (feature.get("georeference")){
            if (goog.DEBUG){
                console.log('Add map to layer management.')
            };

            // display the map on top of the the base map
            this.map_.addLayer(this.createHistoricMapForFeature_(feature));

            if (vk2.settings.MODE_3D && window['ol3d'] !== undefined) {
                // add vector geometry for the given historic map to a special layer for simulate 3d mode experience
                var feature = vk2.layer.HistoricMap.createClipFeature(feature.getGeometry().clone(), feature.getId(),
                    feature.get('time'), feature.get('title'))
                this.historicMapClickLayer_.getSource().addFeature(feature);
            };
        };

    }, undefined, this);

    // register gazetteer tool
    goog.events.listen(spatialTemporalSearchModule.getGazetteerSearchTool(), 'jumpto', function(event){
        var lonlat = event.target['lonlat'],
            center = ol.proj.transform([parseFloat(lonlat[0]),parseFloat(lonlat[1])],
                event.target['srs'], vk2.settings.MAPVIEW_PARAMS['projection']);

        this.map_.zoomTo(center, 6);
    }, undefined, this);
};

/**
 * @param {Array.<ol.Feature>} features
 * @static
 */
vk2.module.MapModule.showMapProfile = function(features) {
    if (features.length > 0){
        var modal = new vk2.utils.Modal('vk2-overlay-modal',document.body, true);
        modal.open(undefined, 'mapcontroller-click-modal');

        var section = goog.dom.createDom('section');
        for (var i = 0; i < features.length; i++){
            var anchor = goog.dom.createDom('a', {
                'href': vk2.utils.routing.getMapProfileRoute(features[i].getId()),
                'innerHTML': features[i].get('title') + ' ' + features[i].get('time'),
                'target':'_self'
            });
            goog.dom.appendChild(section, anchor);
            goog.dom.appendChild(section, goog.dom.createDom('br'));
        };
        modal.appendToBody(section, 'map-profile');

        if (features.length == 1)
            anchor.click();
    }
};