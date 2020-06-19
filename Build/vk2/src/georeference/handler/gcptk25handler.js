goog.provide('vk2.georeference.handler.GCPTK25Handler');
goog.provide('vk2.georeference.handler.GCPTK25HandlerEventType');

goog.require('vk2.georeference.handler.GCPDefaultHandler');

/**
 * @enum
 */
vk2.georeference.handler.GCPTK25HandlerEventType = {
	ADD_GCP_CLIPPOLYGON: 'add-gcp-clippolygon'
};

/**
 * Not used anymore
 * @deprecated
 * @param {vk2.GCPTK25HandlerOptions} options
 * @constructor
 * @extends {vk2.georeference.handler.GCPDefaultHandler}
 */
vk2.georeference.handler.GCPTK25Handler = function(options){
	
	/**
	 * @type {vk2.viewer.ZoomifyViewer}
	 * @private
	 */
	this.srcViewer_ = options.srcViewer;
	
	goog.base(this, options);
};
goog.inherits(vk2.georeference.handler.GCPTK25Handler, vk2.georeference.handler.GCPDefaultHandler);

/**
 * Load specific TK25 gcp behavior
 * 
 * @override
 */
vk2.georeference.handler.GCPTK25Handler.prototype.activate_ = function(){
	this.initializeGCPTK25Behavior_(this.sources_);
};

/**
 * @param {Array.<ol.source.Vector>} sources
 * @private
 */
vk2.georeference.handler.GCPDefaultHandler.prototype.initializeGCPTK25Behavior_ = function(sources){
	
	// activate special behavior because of newMtbGcp (means there are target coordinates given but no
	// source coordinates)
	var srcViewer_ = this.srcViewer_,
		gcps_ = this.gcps_,
		targetProjection_ = this.projections_['target'];
	
	// should switch the TK25 behavior to the target behavior
	var switchToDefaultGcpBehaviorMode_ = goog.bind(function(){
		sources[0].un('addfeature', addSourceGcp);
		sources[1].un('addfeature', blockedTargetSourceHandler_);
		this.initializeGCPDefaultBehavior_(sources);
	}, this);
	
	/**
	 * @param {Array.<number>} coordinate
	 * @param {number} width
	 * @param {number} height
	 * @private
	 */
	var getMtbCornerType_ = function(coordinate, width, height){
		var cornerType;
		var assumption_MidHeight = width / 2;
		var assumption_MidWidth = height / 2;
		
		// checks
		var xlow = (coordinate[0] - assumption_MidWidth > 0) ? false : true;
		var ylow = (coordinate[1] - assumption_MidHeight > 0) ? false : true;
		
		// detect correct corner typ (recalculate it to pixel coordinates)
		if (xlow && ylow) 
			cornerType = 'ulc';
		if (xlow && !ylow) 
			cornerType = 'llc';	
		if (!xlow && ylow) 
			cornerType = 'urc';		
		if (!xlow && !ylow) 
			cornerType = 'lrc';
		return cornerType;
	};
	
	/**
	 * @param {Array.<Object>} gcps
	 * @param {string} cornerType
	 * @return {Array.<number>}
	 */
	var getMtbTargetCoordinate = function(gcps, cornerType){
		// handling special case that only coordinates are delivered
		var coordinatesSortedAfterCorners = {};
		if (gcps.length > 0){				
			// identifiy  and parse corners
			var lowX = gcps[0]['target'][0], lowY = gcps[0]['target'][1]; 
			for (var i = 0; i < gcps.length; i++){
				if (gcps[i]['target'][0] < lowX)
					lowX = gcps[i]['target'][0];
				if (gcps[i]['target'][1] < lowY)
					lowY = gcps[i]['target'][1];
			};
			
			for (var i = 0; i < gcps.length; i++){
				if (gcps[i]['target'][0] === lowX && gcps[i]['target'][1] === lowY)
					coordinatesSortedAfterCorners['llc'] = gcps[i]['target'];
				if (gcps[i]['target'][0] === lowX && gcps[i]['target'][1] > lowY)
					coordinatesSortedAfterCorners['ulc'] = gcps[i]['target'];
				if (gcps[i]['target'][0] > lowX && gcps[i]['target'][1] === lowY)
					coordinatesSortedAfterCorners['lrc'] = gcps[i]['target'];
				if (gcps[i]['target'][0] > lowX && gcps[i]['target'][1] > lowY)
					coordinatesSortedAfterCorners['urc'] = gcps[i]['target'];
			};
		};
		
		return coordinatesSortedAfterCorners[cornerType];
	};
	
	var dispatchEventAddClipPolygon = goog.bind(function(){
		var features = sources[0].getFeatures(),
			clipPoints = {};
			
		for (var i = 0; i < features.length; i++){
			var coordinate = vk2.utils.transformGeoCoordsToPixel(features[i].getGeometry().getCoordinates()),
				cornerType = getMtbCornerType_(coordinate, srcViewer_.getHeight(), srcViewer_.getWidth())
				clipPoints[cornerType] = coordinate;
		};
	
		this.dispatchEvent(new goog.events.Event( vk2.georeference.handler.GCPTK25HandlerEventType.ADD_GCP_CLIPPOLYGON, {
			'clip': {
				'source':'pixel',
				'polygon':[ clipPoints['ulc'], clipPoints['urc'], clipPoints['lrc'], clipPoints['llc'], clipPoints['ulc']]
			}
		}));
	}, this);
	
	var addSourceGcp = goog.bind(function(event){
		var srcFeature = event['feature'],
			coordinate = vk2.utils.transformGeoCoordsToPixel(srcFeature.getGeometry().getCoordinates()),
			cornerType = getMtbCornerType_(coordinate, srcViewer_.getHeight(), srcViewer_.getWidth()),
			targetCoordinate = getMtbTargetCoordinate(gcps_['gcps'], cornerType),
			targetCoordinateTransformed = ol.proj.transform(targetCoordinate, gcps_['target'],targetProjection_),
			targetFeature = new ol.Feature(new ol.geom.Point(targetCoordinateTransformed)),	
			processid = this.addGCPHandler_.getRunningProcessId();
			
		// set process id
		srcFeature.setId(processid);
		targetFeature.setId(processid);
		
		// set the styles of the features
		var style = vk2.utils.Styles.getGeoreferencePointStyle();
		style.getText().setText(processid);
		srcFeature.setStyle(style);
		targetFeature.setStyle(style);
		
		// add target feature to source
		sources[1].addFeature(targetFeature);
		
		// check if the old behavior should be switched to the new one
		if (sources[0].getFeatures().length === 4){
			switchToDefaultGcpBehaviorMode_();
			dispatchEventAddClipPolygon();
		};
	}, this);
	
	var blockedTargetSourceHandler_ = function(event){
		if (!goog.isDef(event['feature'].getId())){
			alert('As first please select the 4 corner points on the source map.');
			this.removeFeature(event['feature']);
		};
	};
				
	sources[0].on('addfeature', addSourceGcp);
	sources[1].on('addfeature', blockedTargetSourceHandler_);
	
};