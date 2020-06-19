goog.provide('vk2.georeference.view.TargetView');

goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.Timer');

goog.require('vk2.control.LayerSpy');
goog.require('vk2.settings');
goog.require('vk2.layer.Messtischblatt');
goog.require('vk2.tool.OpacitySlider');
goog.require('vk2.tool.GazetteerSearch');
goog.require('vk2.utils');

/**
 * @param {string} map_container
 * @param {Array.<Array.<number>>} opt_extent
 * @constructor
 */
vk2.georeference.view.TargetView = function(mapElId, opt_extent){
	
	/**
	 * @type {string}
	 * @private
	 */
	this.proj_ = vk2.settings.MAPVIEW_PARAMS['projection'];
	
	/**
	 * @type {ol.layer.Tile|undefined}
	 * @private
	 */
	this.valLayer_ = undefined;
	
	/**
	 * @type {Element}
	 * @private
	 */
	this.parentEl_ = goog.dom.getElement(mapElId);
	
	var extent_ = goog.isDef(opt_extent) ? opt_extent : [640161.933,5958026.134,3585834.8011505,7847377.4901306],
		baseLayer_ = new ol.layer.Tile({ 'source': new ol.source.XYZ({
			'urls': vk2.settings.OSM_URLS,
			'crossOrigin': '*',
			'attributions': [],
			'maxZoom': 18
		})});
			
	/**
	 * @type {ol.Map}
	 * @private
	 */
	this.map_ = new ol.Map({
		  'layers': [ baseLayer_ ],
		  'interactions': ol.interaction.defaults().extend([
		      new ol.interaction.DragZoom()
		  ]),
		  'renderer': 'canvas',
		  'target': this.parentEl_,
		  'view': new ol.View({
			  	'projection': this.proj_,
			    'center': [0, 0],
			    'zoom': 2
		  }),
		  'controls': [
		       new ol.control.FullScreen(),
		       new ol.control.Zoom(),
		       new ol.control.Attribution(),
			   new vk2.control.LayerSpy({
					'spyLayer':new ol.layer.Tile({
						'attribution': undefined,
						'source': new ol.source.OSM()
					})
			   })
			   //new ol.control.MousePosition()
		  ]
	});
	
	// zoom to map extent
	this.map_.getView().fit(extent_, this.map_.getSize());

	if (goog.isDef(opt_extent)) {
		/**
		 * @type {ol.control.ZoomToExtent}
		 * @private
		 */
		this.zoomToExtentControl_ = new ol.control.ZoomToExtent({ 'extent': extent_ });
		// add zoom to extent control
		this.map_.addControl(this.zoomToExtentControl_);
	}

	
	// add gazetteer to view
	var gazetteer = new vk2.tool.GazetteerSearch(this.parentEl_, vk2.settings.NOMINATIM_URL);
	
	// jumps to extent
	goog.events.listen(gazetteer, 'jumpto', function(event){
		var view = this.map_.getView();
		var lonlat = event.target['lonlat'];
		view.setCenter(ol.proj.transform([parseFloat(lonlat[0]),parseFloat(lonlat[1])], 
				event.target['srs'], this.proj_));
		view.setZoom(12);
	}, undefined, this);
	
	// remove first attribution list entry
	goog.dom.getElementByClass('ol-attribution').children[0].children[0].remove();
};

/**
 * Function activates a loading bar
 */
vk2.georeference.view.TargetView.prototype.activateLoadingBar = function(){
	
	var loadingPanelId = 'result-viewer-loading-panel',
		loadingPanel = this.getLoadingPanel_(loadingPanelId);
	
	if (goog.isDef(loadingPanel))
		return;
	
	goog.dom.appendChild(this.parentEl_, goog.dom.createDom('div', {
		'class': loadingPanelId,
		'id': loadingPanelId,
		'innerHTML': '<div class="progress"><div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100"' +
			'aria-valuemin="0" aria-valuemax="100" style="width: 100%"><span class="sr-only">100% Complete</span></div></div>'
	}));
};

/**
 * Function deactivates a loading bar
 */
vk2.georeference.view.TargetView.prototype.deactivateLoadingBar = function(){
	
	var loadingPanelId = 'result-viewer-loading-panel',
		loadingPanel = this.getLoadingPanel_(loadingPanelId);
	
	if (!goog.isDef(loadingPanel))
		return;
	
	goog.dom.removeNode(loadingPanel);
};

/**
 * @param {string} wms_url Url to the web mapping service which publish the validation file
 * @param {string} layer_id
 * @param {ol.Feature|undefined} opt_clipFeature
 */
vk2.georeference.view.TargetView.prototype.displayValidationMap = function(wms_url, layer_id, opt_clipFeature){

	if (goog.isDef(this.valLayer_)){
		// remove old layer
		this.map_.removeLayer(this.valLayer_);
	};

	// create new validation layer and add layer to correct position
	var clipPolygon = opt_clipFeature !== undefined ? opt_clipFeature.getGeometry() : undefined;
	this.valLayer_ = vk2.layer.Messtischblatt({
		wms_url: wms_url, 
		layerid: layer_id,
		clipPolygon: clipPolygon
	}, this.map_);
	this.map_.getLayers().insertAt(1, this.valLayer_);

	// Remove old opactiy slider and add new one
	if (goog.dom.getElement('opacity-slider-container')){
		var opacitySliderEl = goog.dom.getElement('opacity-slider-container');
		opacitySliderEl.innerHTML = '';
		var opacitySlider = new vk2.tool.OpacitySlider(goog.dom.getElement('opacity-slider-container'), this.valLayer_, 'vertical')
	};

};

/**
 * @returns {ol.Map}
 */
vk2.georeference.view.TargetView.prototype.getMap = function(){
	return this.map_;
};

/**
 * @param {string} loadingPanelId
 * @return {Element|undefined}
 */
vk2.georeference.view.TargetView.prototype.getLoadingPanel_ = function(loadingPanelId){
	// check if a loading panel for the given id exist
	for (var i = 0; i < this.parentEl_.children.length; i++) {
		if (this.parentEl_.children[i].id === loadingPanelId)
			return this.parentEl_.children[i];
	};
	return undefined;
};

/**
 * Called when a new clip polygon should be registered
 * @param {ol.Feature} clipFeature
 */

vk2.georeference.view.TargetView.prototype.registerNewClipFeature = function(clipFeature) {

	if (this.valLayer_ === undefined) {
		// return because there is now layer on which the clip polygon could be used
		return;
	};

	var properties = this.valLayer_.getProperties();
	this.displayValidationMap(properties['wms_url'], properties['layerid'], clipFeature);
};

/**
 * Update the zoom behavior
 * @param {Array.<number>|undefined} opt_extent
 */
vk2.georeference.view.TargetView.prototype.setZoom = function(opt_extent) {

	if (opt_extent !== undefined) {
		// reset control zoomToExtent
		var zoomExtent = opt_extent === undefined ? this.map_.getView().calculateExtent(this.map_.getSize())
			: opt_extent;
		this.map_.removeControl(this.zoomToExtentControl_);
		this.zoomToExtentControl_ = new ol.control.ZoomToExtent({ extent: zoomExtent});
		this.map_.addControl(this.zoomToExtentControl_);

		// zoom to extent by parsing getcapabilites request from wms
		this.map_.getView().fit(zoomExtent, this.map_.getSize());
	}
};