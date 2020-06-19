goog.provide('vk2.georeference.interaction.DeleteGcpInteraction');

goog.require('goog.ui.IdGenerator');

//goog.require('ol.interaction.Interaction');
//goog.require('ol.interaction.Select');

goog.require('vk2.utils.Styles');
goog.require('vk2.georeference.interaction.GeoreferenceInteraction')

/**
 * @param {ol.layer.Vector} unrefGcpLayer
 * @param {ol.layer.Vector} georefGcpLayer
 * @param {ol.Map} unrefMap
 * @param {ol.Map} georefMap
 * @constructor
 * @extends {vk2.georeference.interaction.GeoreferenceInteraction}
 */
vk2.georeference.interaction.DeleteGcpInteraction = function(unrefGcpLayer, georefGcpLayer, unrefMap, georefMap){
		
	/**
	 * @type {Array.<ol.Map>}
	 * @private
	 */
	this.maps_ = [unrefMap, georefMap];
	
	/**
	 * @param {ol.Feature} feature
	 * @param {ol.layer.Vector} unrefGcpLayer
	 * @param {ol.layer.Vector} georefGcpLayer
	 */
	var removeGcp = function(feature, unrefGcpLayer, georefGcpLayer){
		// only run this function in case the feature is of type point
		if (feature.getGeometry().getType().toLowerCase() === 'point') {
			var featureUnref = unrefGcpLayer.getSource().getFeatureById(feature.getId());
			var featureGeoref = georefGcpLayer.getSource().getFeatureById(feature.getId());

			if (goog.isDefAndNotNull(featureUnref))
				unrefGcpLayer.getSource().removeFeature(featureUnref);

			if (goog.isDefAndNotNull(featureGeoref))
				georefGcpLayer.getSource().removeFeature(featureGeoref);
		}
	};
	
	/**
	 * @type {Array.<ol.interaction.Select>}
	 * @private 
	 */
	this.interactions_ = [
	    new ol.interaction.Select({
	    	'condition': ol.events.condition.click,
	    	'layer': unrefGcpLayer,
	    	'style': function(feature, resolution) {
	    		return [vk2.utils.Styles.GEOREFERENCE_POINT_HOVER];
	         },
	         'condition': goog.bind(function(event){
	        	 if (event.type === 'click'){
	        		 unrefMap.forEachFeatureAtPixel(event['pixel'], function(feature){
	        			 removeGcp(feature, unrefGcpLayer, georefGcpLayer);
	        		 });
	            }
	            return false;
	         }, this)
	    }),
	    new ol.interaction.Select({
	    	'condition': ol.events.condition.click,
	    	'layer': georefGcpLayer,
	    	'style': function(feature, resolution) {
	    		return [vk2.utils.Styles.GEOREFERENCE_POINT_HOVER];
	         },
	         'condition': goog.bind(function(event){
	        	 if (event.type === 'click'){
					 georefMap.forEachFeatureAtPixel(event['pixel'], function(feature){
	        			 removeGcp(feature, unrefGcpLayer, georefGcpLayer); 
	        		 });
	            }
	            return false;
	         }, this)
	    })
	];
		
	goog.base(this);
};
goog.inherits(vk2.georeference.interaction.DeleteGcpInteraction, vk2.georeference.interaction.GeoreferenceInteraction);

/**
 * @param {Object} event
 * @public
 */
vk2.georeference.interaction.DeleteGcpInteraction.prototype.activate = function(event){
	if (goog.DEBUG)
		console.log('Activate delete gcp interaction.');
	
	this.activate_();
	this.status_ = true;
};

/**
 * @private
 */
vk2.georeference.interaction.DeleteGcpInteraction.prototype.activate_ = function(){
	if (goog.DEBUG)
		console.log('Activate delete gcp interaction.');
	
	for (var i = 0; i < this.maps_.length; i++){
		this.maps_[i].addInteraction(this.interactions_[i]);
	};
};

/**
 * @param {Object} event
 * @public
 */
vk2.georeference.interaction.DeleteGcpInteraction.prototype.deactivate = function(event){
	if (goog.DEBUG)
		console.log('Deactivate delete gcp interaction.');
	
	this.deactivate_();
	this.status_ = false;
};

/**
 * @private
 */
vk2.georeference.interaction.DeleteGcpInteraction.prototype.deactivate_ = function(){
	if (goog.DEBUG)
		console.log('Deactivate delete gcp interaction.');
	
	for (var i = 0; i < this.maps_.length; i++){
		this.maps_[i].removeInteraction(this.interactions_[i]);
	};
	
};