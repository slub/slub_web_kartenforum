goog.provide('vk2.parser.ElasticSearch');

goog.require('vk2.settings')
//goog.require('ol.proj');

/**
 * Function parses a search record from a elasticsearch query into 
 * an ol object.
 * 
 * @static
 * @param {string} id
 * @param {Object} record
 * @param {string=} opt_source_projection
 * @param {string=} opt_target_projection
 * @return {ol.Feature}
 */
vk2.parser.ElasticSearch.readFeature = function(id, record, opt_source_projection, opt_target_projection){
	
	//if (goog.DEBUG){
	//	console.log(record);
	//};
	
	/**
	 * @type {string}
	 * @private
	 */
	var sourceProjection_ = goog.isDefAndNotNull(opt_source_projection) ? opt_source_projection : 'EPSG:4326';
		
	/**
	 * @type {string}
	 * @private
	 */
	var targetProjection_ = goog.isDefAndNotNull(opt_target_projection) ? opt_target_projection : 'EPSG:900913';
	
	/**
	 * Functions parse the geometry of the search record. 
	 * 
	 * - Function supports right now only simple polygons. No MultiPolygons.
	 * @param {Array.<number>} coordinates
	 * @param {string} type
	 * @param {string} sourceProjection (should be something like 'EPSG:4326')
	 * @param {string} targetPojection (should be something like 'EPSG:3857')
	 * @return {ol.geom.Geometry|undefined}
	 */
	var readGeometry = function(coordinates, type, sourceProjection, targetProjection) {
		if (type.toLowerCase() === 'polygon') {
			// parse polygon
			var coords = [];
			for (var i = 0, ii = coordinates.length; i < ii; i++){

				// transform coordinates in correct projection
				var coordinate = ol.proj.transform(coordinates[i], sourceProjection, targetProjection);

				if (vk2.settings.MODE_3D) {
					// in case 3d mode is active add altitude value to coordinate
					coordinate.push(10000);
				}

				coords.push(coordinate);
			};
			return new ol.geom.Polygon([coords]);
		} 
		return undefined;
	};

	// First try to use the clip polygon as a geometry. As an alternative try to use the geometry attribute
	// In bothe cases the geometry attribute has to be deleted from the record afterwards for proper working of the
	// following code
	var geometry = 'clippolygon' in record ? readGeometry(record['clippolygon'], 'polygon', sourceProjection_, targetProjection_) : undefined,
		geometry = geometry === undefined && 'geometry' in record ? readGeometry(record['geometry']['coordinates'][0],
			record['geometry']['type'], sourceProjection_, targetProjection_) : geometry;
	delete record['geometry'];

	// create feature and append properties
	var feature = new ol.Feature({
		'geometry': geometry
	});
	
	for (var key in record){
		if (record.hasOwnProperty(key)){
			if (key === 'time'){
				// parse time value in old format
				var timeValue = record[key].split('-')[0];
				feature.set(key, timeValue);
			} else {
				feature.set(key, record[key]);
			};			
		};
	};
	
	feature.setId(id);
	return feature;
};

/**
 * Function parses a array of search record from a elasticsearch query into 
 * an ol object.
 * 
 * @static
 * @param {Array.<Object>} records
 * @param {string=} opt_source_projection
 * @param {string=} opt_target_projection
 * @return {Array.<ol.Feature>}
 */
vk2.parser.ElasticSearch.readFeatures = function(records, opt_source_projection, opt_target_projection){
	
	//if (goog.DEBUG){
	//	console.log(records);
	//};
	
	/**
	 * @type {string}
	 * @private
	 */
	var sourceProjection_ = goog.isDefAndNotNull(opt_source_projection) ? opt_source_projection : 'EPSG:4326';
		
	/**
	 * @type {string}
	 * @private
	 */
	var targetProjection_ = goog.isDefAndNotNull(opt_target_projection) ? opt_target_projection : 'EPSG:900913';
	
	var features = [];
	for (var i = 0, ii = records.length; i < ii; i++) {
		features.push(vk2.parser.ElasticSearch.readFeature(records[i]['_id'], records[i]['_source']));
	}; 
	
	return features;
};