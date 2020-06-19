goog.provide('vk2.module.SpatialTemporalSearchModule');

goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.net.XhrIo');

goog.require('vk2.tool.TimeSlider');
goog.require('vk2.tool.TimeSliderEventType');
goog.require('vk2.tool.GazetteerSearch');
goog.require('vk2.module.MapSearchModule');
goog.require('vk2.request.ElasticSearch');
goog.require('vk2.settings');

/**
 * @param {Element|string} parentEl
 * @param {ol.Map} map
 * @param {boolean} georeferenceMode
 * @constructor
 */
vk2.module.SpatialTemporalSearchModule = function(parentEl, map){
	
	var parentEl_ = goog.isString(parentEl) ? goog.dom.getElement(parentEl) : parentEl;

	//
	// Initialize html content
	//
	var containerEl = goog.dom.createDom('div',{'class':'spatialsearch-inner-container'});
	goog.dom.appendChild(parentEl_, containerEl);

	var panelEl = goog.dom.createDom('div',{'class':'spatialsearch-content-panel'});
	goog.dom.appendChild(containerEl, panelEl);

	// add mapsearch body
	var bodyContainerEl_ = goog.dom.createDom('div',{'class':'body-container'});
	goog.dom.appendChild(panelEl, bodyContainerEl_);

	//
	// Load module and tools
	//
	this.loadGazetteerSearch_(bodyContainerEl_);
	this.loadMapSearchModule_(bodyContainerEl_, map, this._loadTimeSlider(bodyContainerEl_));
};

/**
 * @param {Element} parentEl
 * @private
 */
vk2.module.SpatialTemporalSearchModule.prototype.loadGazetteerSearch_ = function(parentEl){
	/**
	 * @type {vk2.tool.GazetteerSearch}
	 * @private
	 */
	this.gazetteer_ = new vk2.tool.GazetteerSearch(parentEl, vk2.settings.NOMINATIM_URL);
};

/**
 * @param {Element} parentEl
 * @param {ol.Map} map
 * @param {vk2.tool.TimeSlider} timeSlider
 * @private
 */
vk2.module.SpatialTemporalSearchModule.prototype.loadMapSearchModule_ = function(parentEl, map, timeSlider){

	/**
	 * @type {vk2.module.MapSearchModule}
	 * @private
	 */
	this.mapsearch_ = new vk2.module.MapSearchModule(parentEl, map);

	// bind mapsearch to timeslider tool
	goog.events.listen(timeSlider, vk2.tool.TimeSliderEventType.TIMECHANGE, function(event){
		this.mapsearch_.getFeatureSource().setTimeFilter(event['target']['time'][0], event['target']['time'][1]);
		this.mapsearch_.getFeatureSource().refresh();
	}, undefined, this);
};

/**
 * @param {Element} parentEl
 * @return {vk2.tool.TimeSlider}
 * @private
 */
vk2.module.SpatialTemporalSearchModule.prototype._loadTimeSlider = function(parentEl){

	// build elasticsearch request
	var requestPayload = vk2.request.ElasticSearch.createStatisticQuery('time'),
		requestUrl = vk2.settings.ELASTICSEARCH_NODE + '/_search',
		timeSlider = new vk2.tool.TimeSlider(parentEl);

	goog.net.XhrIo.send(requestUrl, function(e) {
		var xhr = /** @type {goog.net.XhrIo} */ (e.target),
			timeInterval;

		if (xhr.getResponseJson()) {
			var data = xhr.getResponseJson(),
				max = new Date(data['aggregations']['summary']['max']),
				min = new Date(data['aggregations']['summary']['min']);
			timeInterval = [min.getUTCFullYear(), max.getUTCFullYear()];
		} else {
			timeInterval = [1850, 1970]
		};

		timeSlider.setTimeInterval(timeInterval);
	}, 'POST', JSON.stringify(requestPayload));

	return timeSlider;
};


/**
 * @return {vk2.tool.GazetteerSearch}
 */
vk2.module.SpatialTemporalSearchModule.prototype.getGazetteerSearchTool = function(){
	return this.gazetteer_;
};

/**
 * @return {vk2.module.MapSearchModule}
 */
vk2.module.SpatialTemporalSearchModule.prototype.getMapSearchModule = function(){
	return this.mapsearch_;
};