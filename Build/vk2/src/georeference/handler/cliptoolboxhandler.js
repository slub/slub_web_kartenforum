goog.provide('vk2.georeference.handler.ClipToolboxHandler');

//goog.require('ol.layer.Vector');
//goog.require('ol.source.Vector');
//goog.require('ol.geom.Polygon');
//goog.require('ol.Feature');

goog.require('vk2.georeference.toolbox.ClipToolboxEventType');
goog.require('vk2.georeference.interaction.DrawClipInteraction');
goog.require('vk2.georeference.handler.ToolboxHandler')
goog.require('vk2.settings');
goog.require('vk2.utils');
goog.require('vk2.utils.Styles');

/**
 * @param {vk2.georeference.ClipToolbox) tbx
 * @param {ol.Map} map
 * @param {Object=} opt_clipPolygon
 * @extends {vk2.georeference.handler.ToolboxHandler}
 * @constructor
 */
vk2.georeference.handler.ClipToolboxHandler = function(tbx, map, opt_clipPolygon){

	/**
	 * @type {vk2.georeference.toolbox.ClipToolbox}
	 * @private
	 */
	var tbx_ = tbx;
	
	 /**
	  * @type {ol.source.Vector}
	  * @private
	  */
	this.clipPolygonSource_ = new ol.source.Vector({'features': new ol.Collection()});
	
	// extract clip polygon from passed data
	if (goog.isDef(opt_clipPolygon)){
		var clipFeature = vk2.georeference.utils.extractClipPolygon(opt_clipPolygon)
		this.clipPolygonSource_.addFeature(clipFeature);
	};	
	
	// The features are not added to a regular vector layer/source,
	// but to a feature overlay which holds a collection of features.
	// This collection is passed to the modify and also the draw
	// interaction, so that both can add or modify features.
	/**
	 * @type {ol.layer.Vector}
	 * @private
	 */
	this.featureOverlay_ = new ol.layer.Vector({
		'source': this.clipPolygonSource_,
		'style': vk2.utils.Styles.GEOREFERENCE_CLIP_POLYGON
	});
	this.featureOverlay_.setMap(map);

	/**
	 * @private
 	 * @type {vk2.georeference.interaction.DrawClipInteraction}
	 */
	this.drawClipInteraction_ = new vk2.georeference.interaction.DrawClipInteraction(map, this.featureOverlay_, this.clipPolygonSource_);
	
	/**
	 * @important The key values have to be matching with the ACTIVATE events from 
	 *  	{vk2.georeference.GcpToolboxEventType} and {vk2.georeference.toolbox.ClipToolboxEventTypeEventType}
	 * @type {Object.<vk2.georeference.interaction.GeoreferenceInteraction>}
	 * @private
	 */
	var interactions_ = {
			'activate-drawclip': this.drawClipInteraction_,
			'deactivate-drawclip': this.drawClipInteraction_
	};	
	
	this.coupleToolboxWithInteractions_(tbx_, map, this.featureOverlay_, interactions_);

	goog.base(this, tbx_);
};
goog.inherits(vk2.georeference.handler.ClipToolboxHandler, vk2.georeference.handler.ToolboxHandler);

/**
 * @param {goog.events.Event} event
 */
vk2.georeference.handler.ClipToolboxHandler.prototype.addClipPolygon = function(event){
	var clipPolygon = event.target['clip'],
		clipFeature = vk2.georeference.utils.extractClipPolygon(clipPolygon);
	
	// check if there exist already a clip polygon, if yes do not overwrite it
	if (this.clipPolygonSource_.getFeatures().length === 0){
		this.clipPolygonSource_.addFeature(clipFeature);
		this.featureOverlay_.addFeature(clipFeature);
	};
};

/**
 * The function couples the activate / deactivate behavior with the events from the toolbox objects.
 * @param {vk2.georeference.GcpToolbox} clipToolbox
 * @param {ol.Map} map
 * @param {ol.FeatureOverlay> featureOverlay
 * @param {Object.<vk2.georeference.interaction.GeoreferenceInteraction>} interactions Mapping of the event to the interactions object
 * @private
 */
vk2.georeference.handler.ClipToolboxHandler.prototype.coupleToolboxWithInteractions_ = function(clipToolbox, map, featureOverlay, interactions){
	
	/**
	 * @param {goog.events.Event=} opt_event
	 * Function triggers for all interactions a deactivate action
	 */
	var deactivateInteractions = function(opt_event){	
		
		if (goog.isDef(opt_event)){
			var key = opt_event['type'];
			
			// deactivate specific interaction
			if (goog.isDef(key) && interactions.hasOwnProperty(key)){
				interactions[key].deactivate();
			};
		} else {
			// deactivates all interactions
			for (var key in interactions){
				if (interactions.hasOwnProperty(key)){
					interactions[key].deactivate();
				};
			};
		};
	}; 
	
	/** 
	 * Function activate a specific interaction
	 * @param {goog.events.Event} event
	 */
	var activateInteraction = function(event){
		// deactivate all interactions
		deactivateInteractions();
		
		// activate specific interaction
		interactions[event.type].activate();
	};
	
	/** 
	 * Function activate the toolbox
	 * @param {goog.events.Event} event
	 */
	var activateToolbox = function(event){
		if (goog.DEBUG){
			console.log('Activate Clip Toolbox');
		};
		//featureOverlay.setMap(map);
	};
	
	/** 
	 * Function deactivates the toolbox
	 * @param {goog.events.Event} event
	 */
	var deactivateToolbox = function(event){			
		if (goog.DEBUG){
			console.log('Deactivate Clip Toolbox');
		};
		
		deactivateInteractions();
		//featureOverlay.setMap(null);
	};
	
	// activate and deactivate interactions
	goog.events.listen(clipToolbox, vk2.georeference.toolbox.ClipToolboxEventType.ACTIVATE_DRAWCLIP, activateInteraction);
	goog.events.listen(clipToolbox, vk2.georeference.toolbox.ClipToolboxEventType.DEACTIVATE_DRAWCLIP, deactivateInteractions);
	
	// activate and deactivate toolbox
	goog.events.listen(clipToolbox, vk2.georeference.toolbox.ClipToolboxEventType.ACTIVATE, activateToolbox);
	goog.events.listen(clipToolbox, vk2.georeference.toolbox.ClipToolboxEventType.DEACTIVATE, deactivateToolbox);
};

/**
 * @public
 * @return {vk2.georeference.interaction.DrawClipInteraction}
 */
vk2.georeference.handler.ClipToolboxHandler.prototype.getDrawClipInteration = function(){
	return this.drawClipInteraction_;
};

/**
 * @public
 * @return {ol.source.Vector}
 */
vk2.georeference.handler.ClipToolboxHandler.prototype.getFeatureSource = function(){
	return this.clipPolygonSource_;
};