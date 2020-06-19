goog.provide('vk2.georeference.handler.GCPToolboxHandler');

goog.require('goog.events');

//goog.require('ol.layer.Vector');
//goog.require('ol.source.Vector');

goog.require('vk2.utils.Styles');
goog.require('vk2.georeference.toolbox.GCPToolboxEventType');
goog.require('vk2.georeference.handler.GCPDefaultHandler');
goog.require('vk2.georeference.handler.GCPTK25Handler');
goog.require('vk2.georeference.handler.ToolboxHandler');
goog.require('vk2.georeference.interaction.AddGcpInteraction');
goog.require('vk2.georeference.interaction.DeleteGcpInteraction');
goog.require('vk2.georeference.interaction.DragGcpInteraction');
goog.require('vk2.georeference.interaction.DragGcpInteractionEventType');
goog.require('vk2.georeference.utils');

/**
 * @param {vk2.GCPTK25HandlerOptions} options
 * @extends {vk2.georeference.handler.ToolboxHandler}
 * @constructor
 */
vk2.georeference.handler.GCPToolboxHandler = function(options){
	
	/**
	 * @type {vk2.georeference.GcpHandler}
	 * @private
	 */
	this.gcpHandler_ = options.handler;
	
	/**
	 * @type {vk2.georeference.toolbox.GcpToolbox}
	 * @private
	 */
	var tbx_ = options.toolbox,
		/**
		 * @enum {ol.source.Vector}
		 * @private
		 */
		sources_ = {
			unref: options.sources[0],
			georef: options.sources[1]
		},	
		/**
		 * @enum {ol.Map}
		 * @private
		 */
		maps_ = {
			unref: options.maps[0],
			georef: options.maps[1]
		},	
		/**
		 * @enum {ol.layer.Vector}
		 * @private
		 */
		layers_ = {
			unref: new ol.layer.Vector({
				'source': sources_.unref,
				'style': function(feature, resolution) {
					return [vk2.utils.Styles.GEOREFERENCE_POINT];
				}
			}),
			georef: new ol.layer.Vector({
				'source': sources_.georef,
				'style': function(feature, resolution) {
					return [vk2.utils.Styles.GEOREFERENCE_POINT];
				}
			})
		},
		// create gcpInteractions
		addGcpInteraction = new vk2.georeference.interaction.AddGcpInteraction(sources_.unref, sources_.georef, maps_.unref, maps_.georef),
		dragGcpInteraction = new vk2.georeference.interaction.DragGcpInteraction(layers_.unref, layers_.georef, maps_.unref, maps_.georef),
		deleteGcpInteraction = new vk2.georeference.interaction.DeleteGcpInteraction(layers_.unref, layers_.georef, maps_.unref, maps_.georef),
		/**
		 * @important The key values have to be matching with the ACTIVATE events from 
		 *  	{vk2.georeference.toolbox.GCPToolboxEventType} and {vk2.georeference.ClipToolboxEventType}
		 * @type {Object.<vk2.georeference.interaction.GeoreferenceInteraction>}
		 * @private
		 */
		interactions_ = {
			'activate-addgcp': addGcpInteraction,
			'deactivate-addgcp': addGcpInteraction,
			'activate-draggcp': dragGcpInteraction,
			'deactivate-draggcp': dragGcpInteraction,
			'activate-delgcp': deleteGcpInteraction,
			'deactivate-delgcp': deleteGcpInteraction
		};	

	// append behavior
	this.addEquivalentGcpSelectStyle_(dragGcpInteraction, this.gcpHandler_);
	this.coupleToolboxWithInteractions_(tbx_, maps_, layers_, interactions_);
	
	goog.base(this, tbx_);
};
goog.inherits(vk2.georeference.handler.GCPToolboxHandler, vk2.georeference.handler.ToolboxHandler);

/**
 * Function checks that selected gcp always have the same style on both maps
 * @todo Check if this could be move to Interaction object level
 * @param {vk2.georeference.interaction.DragInteraction} dragGcpInteraction
 * @param {vk2.georeference.GcpHandler} gcpHandler
 */
vk2.georeference.handler.GCPToolboxHandler.prototype.addEquivalentGcpSelectStyle_ = function(dragGcpInteraction, gcpHandler){
	// couple GcpHandler with dragGcpInteraction
	var equivalentGcpStyleBehavior = function(event){
		var baseFeature = event['target']['feature'];
		var selectStyle = event['target']['targetStyle'];
		baseFeature.setStyle(selectStyle);
	};	
	
	goog.events.listen(dragGcpInteraction, vk2.georeference.interaction.DragGcpInteractionEventType.SELECTED, equivalentGcpStyleBehavior);
	goog.events.listen(dragGcpInteraction, vk2.georeference.interaction.DragGcpInteractionEventType.DESELECTED, equivalentGcpStyleBehavior);
};

/**
 * The function couples the activate / deactivate behavior with the events from the toolbox objects.
 * @param {vk2.georeference.toolbox.GcpToolbox} gcpToolbox
 * @param {Enum.<ol.Map>} maps
 * @param {Enum.<ol.layer.Vector> layers
 * @param {Object.<vk2.georeference.interaction.GeoreferenceInteraction>} interactions Mapping of the event to the interactions object
 * @private
 */
vk2.georeference.handler.GCPToolboxHandler.prototype.coupleToolboxWithInteractions_ = function(gcpToolbox, maps, layers, interactions){
	
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
			console.log('Activate GCP Toolbox');
		};
		
		//maps.unref.addLayer(layers.unref);
		//maps.georef.addLayer(layers.georef);
	};
	
	/** 
	 * Function deactivates the toolbox
	 * @param {goog.events.Event} event
	 */
	var deactivateToolbox = function(event){	
		if (goog.DEBUG){
			console.log('Deactivate GCP Toolbox');
		};
		
		deactivateInteractions();
		
		//maps.unref.removeLayer(layers.unref);
		//maps.georef.removeLayer(layers.georef);
	};
	
	// activate and deactivate interactions
	goog.events.listen(gcpToolbox, vk2.georeference.toolbox.GCPToolboxEventType.ACTIVATE_ADDGCP, activateInteraction);
	goog.events.listen(gcpToolbox, vk2.georeference.toolbox.GCPToolboxEventType.DEACTIVATE_ADDGCP, deactivateInteractions);
	goog.events.listen(gcpToolbox, vk2.georeference.toolbox.GCPToolboxEventType.ACTIVATE_DRAGGCP, activateInteraction);
	goog.events.listen(gcpToolbox, vk2.georeference.toolbox.GCPToolboxEventType.DEACTIVATE_DRAGGCP, deactivateInteractions);
	goog.events.listen(gcpToolbox, vk2.georeference.toolbox.GCPToolboxEventType.ACTIVATE_DELGCP, activateInteraction);
	goog.events.listen(gcpToolbox, vk2.georeference.toolbox.GCPToolboxEventType.DEACTIVATE_DELGCP, deactivateInteractions);
	
	// activate and deactivate toolbox
	goog.events.listen(gcpToolbox, vk2.georeference.toolbox.GCPToolboxEventType.ACTIVATE, activateToolbox);
	goog.events.listen(gcpToolbox, vk2.georeference.toolbox.GCPToolboxEventType.DEACTIVATE, deactivateToolbox);
	maps.unref.addLayer(layers.unref);
	maps.georef.addLayer(layers.georef);
};

/**
 * @public
 * @return {vk2.georeference.handler.GcpHandler}
 */
vk2.georeference.handler.GCPToolboxHandler.prototype.getHandler = function(){
	return this.gcpHandler_;
};