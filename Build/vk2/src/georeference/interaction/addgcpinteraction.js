goog.provide('vk2.georeference.interaction.AddGcpInteraction');

//goog.require('ol.interaction.Draw');

goog.require('vk2.utils.Styles');
goog.require('vk2.georeference.interaction.GeoreferenceInteraction')

/**
 * @param {ol.source.Vector} unrefGcpSource
 * @param {ol.source.Vector} georefGcpSource
 * @param {ol.Map} unrefMap
 * @param {ol.Map} georefMap
 * @constructor
 * @extends {vk2.georeference.interaction.GeoreferenceInteraction}
 */
vk2.georeference.interaction.AddGcpInteraction = function(unrefGcpSource, georefGcpSource, unrefMap, georefMap){
	
	/**
	 * @type {Array.<ol.source.Vector>}
	 * @private
	 */
	this.sources_ = [unrefGcpSource, georefGcpSource];
	
	/**
	 * @type {Array.<ol.Map>}
	 * @private
	 */
	this.maps_ = [unrefMap, georefMap];
	
	/**
	 * @type {Array.<ol.interaction.Draw>}
	 * @private
	 */
	this.interactions_ = [
		new ol.interaction.Draw({
			'source': unrefGcpSource,
			'type': 'Point',
			'style': function(feature, resolution) {
				return [vk2.utils.Styles.GEOREFERENCE_POINT_HOVER]
			}
		}),
		new ol.interaction.Draw({
			'source': georefGcpSource,
			'type': 'Point',
			'style': function(feature, resolution) {
				return [vk2.utils.Styles.GEOREFERENCE_POINT_HOVER]
			}
		})
	];

	goog.base(this);
};
goog.inherits(vk2.georeference.interaction.AddGcpInteraction, vk2.georeference.interaction.GeoreferenceInteraction);

/**
 * @param {Object} event
 * @public
 */
vk2.georeference.interaction.AddGcpInteraction.prototype.activate = function(event){
	if (goog.DEBUG)
		console.log('Activate add gcp interaction.');
	
	this.activate_();
	this.status_ = true;
};

/**
 * @private
 */
vk2.georeference.interaction.AddGcpInteraction.prototype.activate_ = function(){
	if (goog.DEBUG)
		console.log('Activate add gcp interaction.');
	
	for (var i = 0; i < this.maps_.length; i++){
		this.maps_[i].addInteraction(this.interactions_[i]);
	};
};

/**
 * @param {Object} event
 * @public
 */
vk2.georeference.interaction.AddGcpInteraction.prototype.deactivate = function(event){
	if (goog.DEBUG)
		console.log('Deactivate add gcp interaction.');
	
	this.deactivate_();
	this.status_ = false;
};

/**
 * @private
 */
vk2.georeference.interaction.AddGcpInteraction.prototype.deactivate_ = function(){
	if (goog.DEBUG)
		console.log('Deactivate add gcp interaction.');
	
	// remove the interactions
	for (var i = 0; i < this.maps_.length; i++){
		this.maps_[i].removeInteraction(this.interactions_[i]);
	};
	
};