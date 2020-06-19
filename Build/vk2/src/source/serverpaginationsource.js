goog.provide('vk2.source.ServerPagination');
goog.provide('vk2.source.ServerPaginationEventType');

//goog.require('ol.extent');
goog.require('goog.array');
goog.require('goog.net.XhrIo');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('vk2.utils');
goog.require('vk2.request.ElasticSearch');
goog.require('vk2.parser.ElasticSearch');
goog.require('vk2.settings');

/**
 * @enum {string}
 */
vk2.source.ServerPaginationEventType = {
		// Is triggered if there was a pagination event. Incrementel data is added.
		PAGINATE: 'paginate',
		// Refresh is called when the complete search data is refreshed
		REFRESH: 'refresh'
};


/**
 * @classdesc
 * A vector source in one of the supported formats, using a custom function to
 * read in the data from a remote server.
 *
 * @param {vk2x.source.ServerPaginationOptions} options
 * @constructor
 * @extends {goog.events.EventTarget}
 */
vk2.source.ServerPagination = function(options) {

	/**
	 * @private
	 * @type {string}
	 */
	this.projection_ = goog.isDef(options.projection) ? options.projection : 'EPSG:900913';
	  
	/**
	 * @private
	 * @type {number}
	 */
	this.maxFeatures_ = goog.isDef(options.maxfeatures) ?
	  options.maxfeatures : 20;
	
	/**
	 * @private
	 * @type {Array.<number>|undefined} An array of numbers representing an extent: [minx, miny, maxx, maxy]
	 */
	this.lastUpdateExtent_ = undefined;
	  
	/**
	 * @private
	 * @type {ol.Collection}
	 */
	this.featureCol_ = new ol.Collection();
	
	/**
	 * @private
	 * @type {string}
	 */
	this.sortAttribute_ = 'title';
	
	/**
	 * @private
	 * @type {string}
	 */
	this.sortOrder_ = 'ascending';
	
	/**
	 * This variable give the starting point for pagination
	 * @private
	 * @type {number}
	 */
	this.index_ = 0;
	
	/**
	 * @private
	 * @type {number|undefined}
	 */
	this.totalFeatures_ = undefined;
	  
	
	var start = goog.isDef(options.time) ? options.time[0] : 1625,
		end = goog.isDef(options.time) ? options.time[1] : 1965;
	/**
	 * @type {Object}
	 * @private
	 */
	this.timeFilter_ = {
		START: start,
		END: end
	};

	/**
	 * @private
	 * @type {ol.Map}
	 */
	this.map_ = options.map;
	
	/**
	 * @private
	 * @type {Array.<Object>}
	 */
	this.facets_ = [];
	
	/**
	 * @private
	 * @type {boolean}
	 */
	this.georeference_ = true;
	   
	/**
	 * For preventing deep pagination
	 * @type {number}
	 * @private
	 */
	this.MAX_PAGINATION_FEATURE = 500;
	
  	this.activate();
	
  	goog.base(this);
};
goog.inherits(vk2.source.ServerPagination, goog.events.EventTarget);

/**
 * 
 */
vk2.source.ServerPagination.prototype.activate = function(){
	this.map_.on('moveend', function(){
		var spatialExtent = vk2.utils.calculateMapExtentForPixelViewport(this.map_);
		if (!goog.isDef(this.lastUpdateExtent_) || !ol.extent.equals(this.lastUpdateExtent_, spatialExtent)){
			this.update_();
		};
	}, this);
};

/**
 * @param {Array.<number>} extent An array of numbers representing an extent: [minx, miny, maxx, maxy]
 * @param {string} projection
 * @return {Object}
 * @private
 */
vk2.source.ServerPagination.prototype.createSearchRequest_ = function(extent, projection){
	
	var timeValues = [this.timeFilter_.START + '-01-01', this.timeFilter_.END + '-01-01'],
		sortOrd_ = this.sortOrder_ === 'ascending' ? 'asc' : 'desc';
	
	if (this.georeference_){
		// build response with bbox filter
		var bboxPolygon = vk2.utils.getPolygonFromExtent(ol.proj.transformExtent(extent, projection, vk2.settings.ELASTICSEARCH_SRS));
		return vk2.request.ElasticSearch.getSpatialQuery('time', timeValues,
				'geometry', bboxPolygon, this.sortAttribute_, sortOrd_, this.facets_);
	} else {
		return vk2.request.ElasticSearch.getToGeorefQuery('time', timeValues,
				this.sortAttribute_, sortOrd_, this.facets_);
	};		
};

/**
 * @param {Array.<ol.Feature>} features
 * @private
 */
vk2.source.ServerPagination.prototype.dispatchRefreshEvent_ = function(features){
	this.dispatchEvent(new goog.events.Event(vk2.source.ServerPaginationEventType.REFRESH,{
		'features': features,
		'totalFeatureCount': this.totalFeatures_
	}));
	
	//if (goog.DEBUG){
	//	console.log('Refresh event.');
	//	console.log('Size of FeatureCollection: '+this.featureCol_.getLength());
	//	console.log('TotalFeatures: '+this.totalFeatures_);
	//};
}

/**
 * @param {Array.<ol.Feature>} features
 * @private
 */
vk2.source.ServerPagination.prototype.dispatchPaginateEvent_ = function(features){
	this.dispatchEvent(new goog.events.Event(vk2.source.ServerPaginationEventType.PAGINATE,{
		'features': features,
		'totalFeatureCount': this.totalFeatures_
	}));
	
	//if (goog.DEBUG){
	//	console.log('Paginate event.');
	//	console.log('Size of FeatureCollection: '+this.featureCol_.getLength());
	//	console.log('TotalFeatures: '+this.totalFeatures_);
	//};
};

/**
 * @return {ol.Collection}
 */
vk2.source.ServerPagination.prototype.getFeatures = function(){
	return this.featureCol_;
};

///**
//* @param {string} blattnr
//* @return {Array.<ol.Feature>}
//*/
//vk2.source.ServerPagination.prototype.getFeatureForBlattnr = function(blattnr){
//	var returnArr = [];
//	this.featureCol_.forEach(function(feature){
//		if (feature.get('blattnr') === blattnr)
//			returnArr.push(feature);
//	});
//	return returnArr;
//};

/**
 * @return {number|undefined}
 */
vk2.source.ServerPagination.prototype.getTotalFeatures = function(){
	return this.totalFeatures_;
};

/**
 * @return {string}
 */
vk2.source.ServerPagination.prototype.getSortAttribute = function(){
	return this.sortAttribute_;
};

/**
 * @return {string}
 */
vk2.source.ServerPagination.prototype.getSortOrder = function(){
	return this.sortOrder_;
};

/**
 * Method checks if all features for a given extent are loaded. 
 * @return {boolean}
 */
vk2.source.ServerPagination.prototype.isComplete = function(){
	return this.featureCol_.getLength() >= this.totalFeatures_;
};

/**
 * @param {Array.<number>} extent An array of numbers representing an extent: [minx, miny, maxx, maxy]
 * @param {string} projection
 * @param {Function} event_callback
 */
vk2.source.ServerPagination.prototype.loadFeatures_ = function(extent, projection, event_callback){
	
	// build elasticsearch request
	var requestPayload = this.createSearchRequest_(extent, projection),
		requestUrl = vk2.settings.ELASTICSEARCH_NODE + '/_search?from=' + this.index_ + '&size=' + this.maxFeatures_;

	var xhr = new goog.net.XhrIo();
	goog.events.listenOnce(xhr, 'success', function(e){
		//if (goog.DEBUG){
		//	console.log('Receive features');
		//};
				    
		var xhr = /** @type {goog.net.XhrIo} */ (e.target);
		if (xhr.getResponseJson()){
			// parse response GeoJSON 
			var data = xhr.getResponseJson();
			this.totalFeatures_ = data['hits']['total'];
			xhr.dispose();
			var parsedFeatures = vk2.parser.ElasticSearch.readFeatures(
					data['hits']['hits'],vk2.settings.ELASTICSEARCH_SRS, projection);
			
			//if (goog.DEBUG){
			//	console.log(parsedFeatures);
			//};
			
			// fill featureCol and increment startIndex
			this.featureCol_.extend(parsedFeatures);
			this.index_ += parsedFeatures.length;
			    
			event_callback.call(this, parsedFeatures);		
		} else {
			console.log('Response is empty');
		};    
	}, false, this);
	
	xhr.send(requestUrl, 'POST', JSON.stringify(requestPayload));
};

/**
 * @private
 */
vk2.source.ServerPagination.prototype.paginate_ = function(){
	if (goog.DEBUG) {
		console.log('Update Data of ServerPaginationSource.');
	};
	
	// check if there are anymore features to paginate and if yes gramp them
	if (this.index_ < this.totalFeatures_ && this.index_ < this.MAX_PAGINATION_FEATURE){
		var spatialExtent = vk2.utils.calculateMapExtentForPixelViewport(this.map_);
		this.loadFeatures_(spatialExtent, this.projection_, this.dispatchPaginateEvent_);
	};
};

vk2.source.ServerPagination.prototype.refresh = function(){
	this.refreshFeatures_(vk2.utils.calculateMapExtentForPixelViewport(this.map_), this.projection_);
};

/**
 * Triggers a update events based of the actual server pagination settings of the search list.
 * @private
 */
vk2.source.ServerPagination.prototype.update_ = function(){
	if (goog.DEBUG) {
		console.log('Update server pagination data ...');
	};

	var spatialExtent = vk2.utils.calculateMapExtentForPixelViewport(this.map_);
	this.refreshFeatures_(spatialExtent, this.projection_);
	this.lastUpdateExtent_ = goog.array.clone(spatialExtent);
};

/**
 * @param {Array.<number>} extent An array of numbers representing an extent: [minx, miny, maxx, maxy]
 * @param {string} projection
 */
vk2.source.ServerPagination.prototype.refreshFeatures_ = function(extent, projection) {
	this.featureCol_.clear();
	this.index_ = 0;
	this.loadFeatures_(extent, projection, this.dispatchRefreshEvent_);
};

/**
 * @param {Object} newFacets
 */
vk2.source.ServerPagination.prototype.setFacets = function(newFacets) {
	this.georeference_ = newFacets['georeference'];
	this.facets_ = newFacets['facets'];
	this.update_();
};

/**
 * @param {string} sortAttribute
 */
vk2.source.ServerPagination.prototype.setSortAttribute = function(sortAttribute){
	this.sortAttribute_ = sortAttribute;
};

/**
 * @param {string} sortOrder
 */
vk2.source.ServerPagination.prototype.setSortOrder = function(sortOrder){
	this.sortOrder_ = sortOrder;
};

/**
 * @param {number=} opt_start_time
 * @param {number=} opt_end_time
 */
vk2.source.ServerPagination.prototype.setTimeFilter = function(opt_start_time, opt_end_time){
	// incase of a resetting
	var old_start = this.timeFilter_.START;
	
	if (goog.isDefAndNotNull(opt_start_time) && goog.isNumber(opt_start_time)){
		if (opt_start_time > this.timeFilter_.END)
			throw {'name':'WrongParameterExecption','message':'Start value shouldn\'t be higher than the end value.'}
		this.timeFilter_.START = opt_start_time;
	};
		
	if (goog.isDefAndNotNull(opt_end_time) && goog.isNumber(opt_end_time)){
		if (opt_end_time < this.timeFilter_.START){
			// reset start value and throw error
			this.timeFilter_.START = old_start;
			throw {'name':'WrongParameterExecption','message':'End value shouldn\'t be lower than the start value.'};
		};
		this.timeFilter_.END = opt_end_time;
	};
};