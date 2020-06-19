goog.provide('vk2.georeference.interaction.DragGcpInteraction');
goog.provide('vk2.georeference.interaction.DragGcpInteractionEventType');

goog.require('goog.events.Event');
goog.require('goog.ui.IdGenerator');

//goog.require('ol.interaction.Interaction');
//goog.require('ol.interaction.Modify');
//goog.require('ol.interaction.Select');

goog.require('vk2.utils.Styles');
goog.require('vk2.georeference.interaction.GeoreferenceInteraction')

/**
 * @enum
 */
vk2.georeference.interaction.DragGcpInteractionEventType = {
	SELECTED: 'selected',
	DESELECTED: 'deselected'
};


/**
 * @param {ol.layer.Vector} unrefGcpLayer
 * @param {ol.layer.Vector} georefGcpLayer
 * @param {ol.Map} unrefMap
 * @param {ol.Map} georefMap
 * @constructor
 * @extends {vk2.georeference.interaction.GeoreferenceInteraction}
 */
vk2.georeference.interaction.DragGcpInteraction = function(unrefGcpLayer, georefGcpLayer, unrefMap, georefMap){
		
	/**
	 * @type {Array.<ol.Map>}
	 * @private
	 */
	this.maps_ = [unrefMap, georefMap];

	/**
	 * @private
	 * @type {ol.style.Style}
	 */
	this.defaultStyle_ = unrefGcpLayer.getStyle();

	/**
	 * @private
	 * @type {ol.style.Style}
	 */
	this.hoverStyle_ = vk2.utils.Styles.getGeoreferencePointHover();

	/**
	 * @type {Array.<Array.<ol.interaction.Interaction>>}
	 * @private
	 */
	this.interactions_ = [
		new ol.interaction.Modify({
			'features': unrefGcpLayer.getSource().getFeaturesCollection(),
			'pixelTolerance': 10,
			'style': function(feature, resolution) {
				return [vk2.utils.Styles.getGeoreferencePointHover()];
			}
		}),
		new ol.interaction.Modify({
			'features': georefGcpLayer.getSource().getFeaturesCollection(), //selects_[1].getFeatures(),
			'pixelTolerance': 10,
			'style': function(feature, resolution) {
				return [vk2.utils.Styles.getGeoreferencePointHover()];
			}
		})
	];

	// as a fix for accessing the correct map in case of an event
	this.interactions_[0].getMap = function() { return unrefMap; };
	this.interactions_[1].getMap = function() { return georefMap; };

	// append event behavior if features are selected
	this.loadEventBehavior_(this.interactions_, [unrefGcpLayer, georefGcpLayer]);
	
	goog.base(this);
};
goog.inherits(vk2.georeference.interaction.DragGcpInteraction, vk2.georeference.interaction.GeoreferenceInteraction);

/**
 * @param {Object} event
 * @public
 */
vk2.georeference.interaction.DragGcpInteraction.prototype.activate = function(event){
	if (goog.DEBUG)
		console.log('Activate drag gcp interaction.');
	
	this.activate_();
	this.status_ = true;
};

/**
 * @private
 */
vk2.georeference.interaction.DragGcpInteraction.prototype.activate_ = function(){
	if (goog.DEBUG)
		console.log('Activate drag gcp interaction.');
	
	for (var i = 0; i < this.maps_.length; i++){
		this.maps_[i].addInteraction(this.interactions_[i]);
	};
};

/**
 * @param {Object} event
 * @public
 */
vk2.georeference.interaction.DragGcpInteraction.prototype.deactivate = function(event){
	if (goog.DEBUG)
		console.log('Deactivate drag gcp interaction.');
	
	this.deactivate_();
	this.status_ = false;
};

/**
 * @private
 */
vk2.georeference.interaction.DragGcpInteraction.prototype.deactivate_ = function(){
	if (goog.DEBUG)
		console.log('Deactivate drag gcp interaction.');
	
	// remove the interactions
	for (var i = 0; i < this.maps_.length; i++){
		this.maps_[i].removeInteraction(this.interactions_[i]);
	};
};

/**
 * This event handling is necessary for update the style of the selected features equivalently
 * @param {Array.<ol.interaction.Modify>} selects
 * @param {Array.<ol.layer.Vector>} layers
 * @private
 */
vk2.georeference.interaction.DragGcpInteraction.prototype.loadEventBehavior_ = function(modifies, layers){

	var unrefSource = layers[0].getSource(),
		georefSource = layers[1].getSource();

	/**
	 * Helper function for extracting the equivalent feature to the modify event
	 * @param {ol.Map} map
	 * @param {Array.<number>} pixel
	 * @param {ol.source.Vector} targetSource
	 * @returns {ol.Feature|undefined}
	 */
	var getFeatureForBrowserEventInTargetSource = function(map, pixel, targetSource) {
		var feature;
		map.forEachFeatureAtPixel(pixel, function(ft) {
			feature = ft;
		});
		return targetSource.getFeatureById(feature.getId());
	};

	var dispatchSelectEvent = function(targetSource, event){
		var feature = getFeatureForBrowserEventInTargetSource(event['target'].getMap(), event['mapBrowserPointerEvent']['pixel'], targetSource);

		// dispatch event
		if (goog.isDefAndNotNull(feature.getId()))
			this.dispatchEvent(new goog.events.Event(vk2.georeference.interaction.DragGcpInteractionEventType.SELECTED, {
				'feature': feature,
				'srcStyle': vk2.utils.Styles.getGeoreferencePointStyle(feature.getId()),
				'targetStyle': vk2.utils.Styles.getGeoreferencePointHover(feature.getId())
			}));
	};
	
	var dispatchDeselectEvent = function(targetSource, event){
		var feature = getFeatureForBrowserEventInTargetSource(event['target'].getMap(), event['mapBrowserPointerEvent']['pixel'], targetSource);

		// dispatch event
		if (goog.isDefAndNotNull(feature.getId()))
			this.dispatchEvent(new goog.events.Event(vk2.georeference.interaction.DragGcpInteractionEventType.DESELECTED, {
				'feature': feature,
				'srcStyle': vk2.utils.Styles.getGeoreferencePointHover(feature.getId()),
				'targetStyle': vk2.utils.Styles.getGeoreferencePointStyle(feature.getId())
			}));
	};

	modifies[0].on('modifystart', goog.bind(dispatchSelectEvent, this, georefSource));
	modifies[1].on('modifystart', goog.bind(dispatchSelectEvent, this, unrefSource));
	modifies[0].on('modifyend', goog.bind(dispatchDeselectEvent, this, georefSource));
	modifies[1].on('modifyend', goog.bind(dispatchDeselectEvent, this, unrefSource));
};

/**
 * Extending the ol.Collection
 * @param {ol.Feature}
 * @private
 */
ol.Collection.prototype.addFeature = function(feature){
	// first check if the feature is in the collection
	var isFeatureInCollection = false;	
	this.forEach(function(ft){
		if (ft === feature)
			isFeatureInCollection = true;
	});
	
	// if the feature is not in the collection add it
	if (!isFeatureInCollection)
		this.push(feature);	
};

/**
 * Extending the ol.Collection
 * @param {ol.Feature}
 * @private
 */
ol.Collection.prototype.removeFeature = function(feature){
	// first check if the feature is in the collection
	var isFeatureInCollection = false;	
	this.forEach(function(ft){
		if (ft === feature)
			isFeatureInCollection = true;
	});
	
	// if the feature is not in the collection add it
	if (isFeatureInCollection)
		this.remove(feature);	
};