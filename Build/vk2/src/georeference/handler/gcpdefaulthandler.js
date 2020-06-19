goog.provide('vk2.georeference.handler.GCPDefaultHandler');
goog.provide('vk2.georeference.handler.GCPDefaultHandlerEventType');

goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');

//goog.require('ol.Feature');
//goog.require('ol.geom.Point');

goog.require('vk2.utils');
goog.require('vk2.georeference.handler.AddGCPHandler');

/**
 * @param {vk2.georeference.handler.GCPDefaultHandlerOptions} options
 *
 * @constructor
 * @extends {goog.events.EventTarget}
 */
vk2.georeference.handler.GCPDefaultHandler = function (options) {

    /**
     * GCP and coordinate reference system of the GCP
     * @type {Object}
     * @protected
     */
    this.gcps_ = goog.isDef(options.gcps) && goog.isObject(options.gcps) ?
        goog.isDef(options.gcps['new']) ? goog.object.clone(options.gcps['new']) :
            goog.object.clone(options.gcps) : {
        'source': 'pixel',
        'target': 'EPSG:4314'
    };

    /**
     * Id of the georeference process which will be overwritten
     * @type {number|undefined}
     * @protected
     */
    this.overwriteId_ = goog.isDef(options.overwriteId) ? options.overwriteId : undefined;

    /**
     * Coordinate reference system of the viewer
     * @type {Object}
     * @protected
     */
    this.projections_ = goog.isDef(options.targetSrs) ? options.projections : {
        'source': 'pixel',
        'target': 'EPSG:900913'
    };

    /**
     * @type {Array.<ol.source.Vector>}
     * @protected
     */
    this.sources_ = options.sources;

    /**
     * @type {boolean}
     * @protected
     */
    this.isUpdateState_ = goog.isDef(options.type) ? this.checkIfUpdateState_(options.type) : false;

    /**
     * @type {vk2.georeference.handler.AddGCPHandler}
     * @protected
     */
    this.addGCPHandler_ = new vk2.georeference.handler.AddGCPHandler();

    // couples both feature sources for binding the points to gcp behavior
    this.activate_();

    goog.base(this);
};
goog.inherits(vk2.georeference.handler.GCPDefaultHandler, goog.events.EventTarget);

/**
 * Functions is called for activation of the gcp behavior. In case of inherited classes this function
 * should be overridden via prototype
 *
 * @override
 */
vk2.georeference.handler.GCPDefaultHandler.prototype.activate_ = function () {
    this.initializeGCPDefaultBehavior_(this.sources_);

    // if their are already gcps add them to the featureSource
    if (this.gcps_.hasOwnProperty('gcps')) {
        this.addGcpToFeatureSources_(this.gcps_, this.sources_, this.projections_);
    }
    ;
};

/**
 * For proper working this method has to be run after the function createGCPSourceBehavior_
 * @param {Object} gcps
 * @param {Array.<ol.source.Vector>} gcpSources
 * @param {Object} targetSrs
 * @private
 */
vk2.georeference.handler.GCPDefaultHandler.prototype.addGcpToFeatureSources_ = function (gcps, gcpSources, projections) {
    for (var i = 0; i < gcps['gcps'].length; i++) {
        var gcp = gcps['gcps'][i],
        // create src feature
            latlonSrs = vk2.utils.transformPixelToGeoCoords(gcp['source']),
            srcFeature = new ol.Feature(new ol.geom.Point(latlonSrs)),
        // create target (georef) feature
            latlonTarget = ol.proj.transform(gcp['target'], gcps['target'], projections['target']),
            targetFeature = new ol.Feature(new ol.geom.Point(latlonTarget));

        gcpSources[0].addFeature(srcFeature);
        gcpSources[1].addFeature(targetFeature);
    }
    ;
};

/**
 * @param {string} type
 * @return {boolean}
 * @private
 */
vk2.georeference.handler.GCPDefaultHandler.prototype.checkIfUpdateState_ = function (type) {
    if (type === 'update')
        return true;
    return false;
};

/**
 * @param {Array.<ol.source.Vector>} sources
 * @private
 */
vk2.georeference.handler.GCPDefaultHandler.prototype.initializeGCPDefaultBehavior_ = function (sources) {
    var addGcpHnd = this.addGCPHandler_;

    /**
     * Closes a process
     * @param {string} processId
     */
    var closeAddingProcess = function (processId) {

        if (goog.DEBUG) {
            console.log('Close adding process');
        }
        ;

        var featureUnref = sources[0].getFeatureById(processId),
            featureGeoref = sources[1].getFeatureById(processId);

        if (goog.isDefAndNotNull(featureUnref) && goog.isDefAndNotNull(featureGeoref)) {
            if (goog.DEBUG) {
                console.log('Feature Id: ' + processId);
            }
            ;

            featureUnref.setProperties({processed: true});
            featureGeoref.setProperties({processed: true});

            // set style
            var style = vk2.utils.Styles.getGeoreferencePointStyle();
            style.getText().setText('' + processId);

            featureUnref.setStyle(style);
            featureGeoref.setStyle(style);

            addGcpHnd.setSrcBlocked(false);
            addGcpHnd.setTargetBlocked(false);
        }
        ;
    };

    // activate normal gcp behavior
    sources[0].on('addfeature', function (event) {
        if (addGcpHnd.getSrcBlocked() === false) {
            if (goog.DEBUG) {
                console.log('Add new gcp to unref source.');
                console.log(event);
            }
            ;

            var processid = addGcpHnd.getRunningProcessId(),
                feature = event['feature'];
            addGcpHnd.setSrcBlocked(true);
            feature.setId(processid);
            feature.setStyle(vk2.utils.Styles.GEOREFERENCE_POINT_PENDING);

            if (addGcpHnd.isFinished()) {
                closeAddingProcess(processid);
            }
            ;
        } else {
            alert('Please add source to other map!');
            this.removeFeature(event['feature']);
        }

    });

    sources[0].on('removefeature', function (event) {
        var processId = event.feature.getId(),
            featureUnref = processId !== undefined ? sources[0].getFeatureById(processId) : undefined,
            featureGeoref = processId !== undefined ? sources[1].getFeatureById(processId) : undefined;

        if (featureGeoref === null & featureUnref === null && addGcpHnd.getSrcBlocked())
            addGcpHnd.setSrcBlocked(false);
    })

    sources[1].on('removefeature', function (event) {
        var processId = event.feature.getId(),
            featureUnref = processId !== undefined ? sources[0].getFeatureById(processId) : undefined,
            featureGeoref = processId !== undefined ? sources[1].getFeatureById(processId) : undefined;

        if (featureGeoref === null & featureUnref === null && addGcpHnd.getTargetBlocked())
            addGcpHnd.setTargetBlocked(false);
    })

    sources[1].on('addfeature', function (event) {

        if (addGcpHnd.getTargetBlocked() === false) {
            if (goog.DEBUG) {
                console.log('Add new gcp to georef source.');
                console.log(event);
            }
            ;

            var processid = addGcpHnd.getRunningProcessId();
            var feature = event['feature'];
            addGcpHnd.setTargetBlocked(true);
            feature.setId(processid);
            feature.setStyle(vk2.utils.Styles.GEOREFERENCE_POINT_PENDING);

            if (addGcpHnd.isFinished()) {
                closeAddingProcess(processid);
            }
            ;
        } else {
            alert('Please add source to other map!');
            this.removeFeature(event['feature']);
        }

    });


};

/**
 * @param {ol.Feature} feature
 * @return {ol.Feature=}
 */
vk2.georeference.handler.GCPDefaultHandler.prototype.getGcpEquivalent = function (feature) {
    var unrefFeature = this.sources_[0].getFeatureById(feature.getId()),
        georefFeature = this.sources_[1].getFeatureById(feature.getId());

    if (feature === unrefFeature)
        return georefFeature;
    else if (feature === georefFeature)
        return unrefFeature;
    return undefined;
};

/**
 * @param {string|undefined} opt_algorithm
 * @param {string|undefined} opt_projection
 * @return {Object}
 * @public
 */
vk2.georeference.handler.GCPDefaultHandler.prototype.getGcpParams = function (opt_algorithm, opt_projection) {
    var algorithm = goog.isDef(opt_algorithm) ? opt_algorithm : 'affine',
        projection = goog.isDef(opt_projection) ? opt_projection : undefined,
        actualGcps = this.getActualGcpParams(projection);
    actualGcps['algorithm'] = algorithm;
    return actualGcps;
};

/**
 * @param {string|undefined} opt_projection
 * @return {Object}
 * @public
 */
vk2.georeference.handler.GCPDefaultHandler.prototype.getActualGcpParams = function (opt_projection) {

    /**
     * @param {Array.<ol.source.Vector>} ftSources
     * @return {Array.<Array.<ol.Feature>>}
     */
    var getActualGcpPairs = function (ftSources) {
        var gcpPairs = [];
        for (var i = 0; i < ftSources[0].getFeatures().length; i++) {
            var ftUnrefGcp = ftSources[0].getFeatures()[i],
                ftGeorefGcp;

            if (goog.isDefAndNotNull(ftUnrefGcp.getId()))
                ftGeorefGcp = ftSources[1].getFeatureById(ftUnrefGcp.getId());

            if (goog.isDefAndNotNull(ftUnrefGcp) && goog.isDefAndNotNull(ftGeorefGcp))
                gcpPairs.push([ftUnrefGcp, ftGeorefGcp]);
        }
        ;
        return gcpPairs;
    };

    /**
     * @param {Array.<Array.<ol.Feature>>} gcpFeatures
     * @param {string} targetProjection
     * @return {Array.<Object>}
     */
    var transformFeaturesToGcpVkviewerProtocol = goog.bind(function (gcpFeatures, targetProjection) {
        var vkviewerGcp = [];
        for (var i = 0; i < gcpFeatures.length; i++) {
            // i.e. {"source": [550, 633], "target": [11.1666660308838, 51.1000022888184]}
            var sourceCoords = vk2.utils.transformGeoCoordsToPixel(gcpFeatures[i][0].getGeometry().getCoordinates());
            var targetCoords = ol.proj.transform(gcpFeatures[i][1].getGeometry().getCoordinates(),
                this.projections_['target'], targetProjection);
            vkviewerGcp.push({
                'source': sourceCoords,
                'target': targetCoords
            });
        }
        ;
        return vkviewerGcp;
    }, this);

    var newGeorefParams = goog.object.clone(this.gcps_),
        targetProj = goog.isDef(opt_projection) ? opt_projection : newGeorefParams['target'];

    newGeorefParams['gcps'] = transformFeaturesToGcpVkviewerProtocol(
        getActualGcpPairs(this.sources_), targetProj
    );
    newGeorefParams['target'] = targetProj;

    return newGeorefParams;
};

/**
 * @return {Object}
 * @public
 */
vk2.georeference.handler.GCPDefaultHandler.prototype.getOldGcpParams = function () {
    return this.gcps_;
};

/**
 * @param {string|undefined} opt_algorithm
 * @param {string|undefined} opt_projection
 * @return {Object}
 * @deprecated
 * @public
 */
vk2.georeference.handler.GCPDefaultHandler.prototype.getGcpsForRequest = function (opt_algorithm, opt_projection) {

    /**
     * @param {Object} gcp
     * @param {Array.<Object>} gcps
     * @return {boolean}
     */
    var checkIfGcpIsInGcpArray = function (gcp, gcps) {
        for (var i = 0; i < gcps.length; i++) {
            var pxXSame = gcps[i]['source'][0] === gcp['source'][0],
                pxYSame = gcps[i]['source'][1] === gcp['source'][1],
                latSame = Math.round(gcps[i]['target'][0] * 10000) / 10000 === Math.round(gcp['target'][0] * 10000) / 10000,
                lonSame = Math.round(gcps[i]['target'][1] * 10000) / 10000 === Math.round(gcp['target'][1] * 10000) / 10000;
            if (pxXSame && pxYSame && latSame && lonSame)
                return true;
        }
        ;
        return false;
    };

    // get the gcps params
    var algorithm = goog.isDef(opt_algorithm) ? opt_algorithm : 'affine',
        currentGeorefParams = goog.object.clone(this.gcps_),
        targetProj = goog.isDef(opt_projection) ? opt_projection : currentGeorefParams['target'],
        oldGeorefParams = this.getOldGcpParams(),
        newGeorefParams = this.getGcpParams(algorithm, targetProj),
        newGeorefParamsInOldSrs = this.getGcpParams(algorithm, currentGeorefParams['target']);

    return newGeorefParams;
};

/**
 * @return {number|undefined}
 */
vk2.georeference.handler.GCPDefaultHandler.prototype.getOverriteId = function () {
    if (goog.isDef(this.overwriteId_))
        return this.overwriteId_;
    return undefined;
};

/**
 * @return {string}
 */
vk2.georeference.handler.GCPDefaultHandler.prototype.getType = function () {
    if (this.isUpdateState_)
        return 'update';
    return 'new';
};