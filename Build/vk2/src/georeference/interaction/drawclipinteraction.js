goog.provide('vk2.georeference.interaction.DrawClipInteraction');
goog.provide('vk2.georeference.interaction.DrawClipInteractionEventType');

//goog.require('ol.interaction.Draw');
//goog.require('ol.interaction.Modify');
//goog.require('ol.layer.Vector');
//goog.require('ol.source.Vector');
goog.require('goog.events.Event');

goog.require('vk2.utils');
goog.require('vk2.utils.Styles');
goog.require('vk2.georeference.interaction.GeoreferenceInteraction')

/**
 * @enum
 */
vk2.georeference.interaction.DrawClipInteractionEventType = {
	DRAWEND: 'drawend'
};

/**
 * @param {ol.Map} map
 * @param {ol.layer.Vector} featureOverlay
 * @constructor
 * @extends {vk2.georeference.interaction.GeoreferenceInteraction}
 */
vk2.georeference.interaction.DrawClipInteraction = function(map, featureOverlay){

	// feature source containing the clip feature
	var source = featureOverlay.getSource();
	
	// The parameter is needed to connect the geometryFunction of the draw interaction and the condition function.
	// Basically the case where the point[i] is the same like point[i - 1] should be prevented. Further the hole
	// condition setup is used for preventing the drawing of triangles.
	var lastPointCoordinate;

	/**
	 * @type {ol.Map}
	 * @private
	 */
	this.map_ = map;

	/**
	 * @type {Array.<ol.interaction.Draw>}
	 * @private
	 */
	this.interactions_ = [
		new ol.interaction.Draw({
			'features': source.getFeaturesCollection(),
			'type': 'Polygon',
			'style': vk2.utils.Styles.GEOREFERENCE_CLIP_POLYGON,
			'minPoints': 5,
			'condition': function(event){
				var coordinate = event['coordinate'];
				if (lastPointCoordinate !== undefined && (vk2.utils.round(lastPointCoordinate[0], 4) === vk2.utils.round(coordinate[0], 4)) &&
					(vk2.utils.round(lastPointCoordinate[1], 4) === vk2.utils.round(coordinate[1], 4))) {
					return false;
				}
				return true;
			},
			'geometryFunction': function(coordinates, geometry){
				if (!geometry) {
					geometry = new ol.geom.Polygon(null);
				}

				// Sstart this condition test when the second point is added to the polygon and end it if more than 3 points are added
				// this should prevent the drawing of triangles
				// INFO: First and last point are the same
				if (geometry.getCoordinates()[0] !== undefined && geometry.getCoordinates()[0].length > 2 && geometry.getCoordinates()[0].length <= 3) {
					lastPointCoordinate = geometry.getCoordinates()[0][geometry.getCoordinates()[0].length -1];
				} else {
					lastPointCoordinate = undefined;
				};

				geometry.setCoordinates(coordinates);
				return geometry;
			}
		}),
		new ol.interaction.Modify({
			  'features': source.getFeaturesCollection(),
			  // the SHIFT key must be pressed to delete vertices, so
			  // that new vertices can be drawn at the same position
			  // of existing vertices
			  'deleteCondition': function(event) {
				  var coordinate = source.getFeatures().length >= 1 ? source.getFeatures()[0].getGeometry().getCoordinates()[0] : undefined;
				  return coordinate !== undefined && coordinate.length > 5 && ol.events.condition.shiftKeyOnly(event) &&
				  	ol.events.condition.singleClick(event);
			  }
		})		
	];
	
	// append listener for preventing the drawing of multiple clip polygons
	this.interactions_[0].on('drawstart', function(event){
		if (goog.DEBUG){
			console.log('Start drawing ...');
		};

		// checks if there exists already a polygon
		if (source.getFeatures().length >= 1)
			this.finishDrawing();
	}, this.interactions_[0]);

	// check that polygon is not malformed
	this.interactions_[0].on('drawend', function(event){
		var polygon = source.getFeatures().length >= 1 ? source.getFeatures()[0].getGeometry() :  event['feature'].getGeometry();

		// Minimum condition is that the polygon must at least have 5 points
		if (polygon.getCoordinates()[0].length < 5) {
			vk2.utils.getConfirmationDialog('Info', vk2.utils.getMsg('georef-confirm-warn-clippolygon'),
				function () {
					return;
				}, 'georef-validation-dialog', false);
			this.finishDrawing();
		} else {
			// clean up the polygon for preventing doubling of coordinates
			var coordinates = polygon.getCoordinates(),
				length = coordinates[0].length;
			if ((vk2.utils.round(coordinates[0][length - 2][0], 4) === vk2.utils.round(coordinates[0][length - 3][0], 4)) &&
				(vk2.utils.round(coordinates[0][length - 2][1], 4) === vk2.utils.round(coordinates[0][length - 3][1], 4))) {
				coordinates[0].splice(length - 2, 1);
				polygon.setCoordinates(coordinates);
			}
		}

		if (goog.DEBUG) {
			console.log('Clip-Polygon: ' + polygon.getCoordinates()[0]);
		};

	}, this.interactions_[0]);
	
	source.getFeaturesCollection().on('add', function(event){
		// check if there is already a feature and if yes prevent to draw a new one
		if (source.getFeatures().length > 1){
			if (goog.DEBUG)
				console.log('There is already a clip polygon ...');
			source.getFeatures().splice(1,1);
			return;
		};

		// dispatch event
		this.dispatchEvent(new goog.events.Event(vk2.georeference.interaction.DrawClipInteractionEventType.DRAWEND, {
			'feature': source.getFeatures()[0]
		}));
	}, this);
	
	goog.base(this);
};
goog.inherits(vk2.georeference.interaction.DrawClipInteraction, vk2.georeference.interaction.GeoreferenceInteraction);

/**
 * @param {Object} event
 * @public
 */
vk2.georeference.interaction.DrawClipInteraction.prototype.activate = function(event){
	if (goog.DEBUG)
		console.log('Activate draw clip interaction.');
	
	this.activate_();
	this.status_ = true;
};

/**
 * @private
 */
vk2.georeference.interaction.DrawClipInteraction.prototype.activate_ = function(){
	if (goog.DEBUG)
		console.log('Activate draw clipinteraction.');
	
	for (var i = 0; i < this.interactions_.length; i++){
		this.map_.addInteraction(this.interactions_[i]);
	};
};

/**
 * @param {Object} event
 * @public
 */
vk2.georeference.interaction.DrawClipInteraction.prototype.deactivate = function(event){
	if (goog.DEBUG)
		console.log('Deactivate draw clip interaction.');
	
	this.deactivate_();
	this.status_ = false;
};

/**
 * @private
 */
vk2.georeference.interaction.DrawClipInteraction.prototype.deactivate_ = function(){
	if (goog.DEBUG)
		console.log('Deactivate draw clip interaction.');
	
	// remove the interactions
	for (var i = 0; i < this.interactions_.length; i++){
		this.map_.removeInteraction(this.interactions_[i]);
	};
	
};