goog.provide('vk2.request.ElasticSearch');
goog.provide('vk2.request.ElasticSearchQuery');

goog.require('goog.net.XhrIo');
goog.require('vk2.settings');

/**
 * @return {Object}
 */
vk2.request.ElasticSearchQuery = function(){
	return {
		"query": {
			"filtered": {
				"filter": {
					"bool": {
						"must": []
					}
				}
			}
		}, 
		"sort": {}
	};
};

/**
 * @param {string} fieldName
 * @param {Array.<number>} coordinates
 * @return {Object}
 */
vk2.request.ElasticSearch.createBBoxQuery_ = function(fieldName, coordinates){
	var bbox_ = { "geo_shape": {} };
	bbox_["geo_shape"][fieldName] = {
		"relation": "intersects",
		"shape": {
			"type": "polygon",
			"coordinates": [coordinates]
		}
	};
	return bbox_;
};

/**
 * @param {Array.<Object>} facets
 * @return {Object}
 */
vk2.request.ElasticSearch.createFacetQuery_ = function(facets){
	var facetsFilter_ = [],
		facets_ = { "bool" : {'should':  facetsFilter_ } };

	for (var i = 0; i < facets.length; i++) {
		var facet_ = facets[i],
			searchTerm_ = {"term": {}};
		
		searchTerm_["term"][facet_["key"]] = facet_["value"].toLowerCase();
		facetsFilter_.push(searchTerm_);
	};
	return facets_;
};

/**
 * @return {Object}
 */
vk2.request.ElasticSearch.createGeorefFalseQuery_ = function(){
	return {"term": { "georeference" : false } };
};

/**
 * @return {Object}
 */
vk2.request.ElasticSearch.createGeorefTrueQuery_ = function(){
	return {"term": { "georeference" : true } };
};

/**
 * @param {string} fieldName
 * @param {Array.<string>} fieldValues
 * @return {Object}
 */
vk2.request.ElasticSearch.createRangeQuery_ = function(fieldName, fieldValues){
	var time_ = { "range": {} };
	time_["range"][fieldName] = {
		"gte": fieldValues[0],
		"lte": fieldValues[1]
	};
	return time_;
};

/**
 * Creates a query for fetching basic statics from the search index like min, max, count, etc.
 * @param {string} stats_field
 * @return {Object}
 */
vk2.request.ElasticSearch.createStatisticQuery = function(stats_field) {
	return {
		"aggs": {
			"summary" : {
				"stats": { "field" : stats_field }
			}
		}
	};
};

/**
 * The function creates a elasticsearch query, which query an index with 
 * a boundingbox and a time range filter. The spatial data in the index is 
 * in WGS84 meaning EPSG:4326.
 * 
 * @static
 * @param {string} timeFieldName
 * @param {Array.<string>} timeValues | Must be [start (1900-01-01), end (1905-01-01)]
 * @param {string} bboxFieldName
 * @param {Array.<number>} bboxPolygon
 * @param {string} sortFieldName
 * @param {string} sortValue | Must be {asc|desc}
 * @param {Array.<Object>} facets
 * @return {Object}
 */
vk2.request.ElasticSearch.getSpatialQuery = function(timeFieldName, timeValues,
		bboxFieldName, bboxPolygon, sortFieldName, sortValue, facets){
	
	// this is the basic structure of the query
	var filter_ = [],
		query_ = vk2.request.ElasticSearchQuery();
	
	// now create the logical filter
	filter_.push(vk2.request.ElasticSearch.createRangeQuery_(timeFieldName, timeValues));
	filter_.push(vk2.request.ElasticSearch.createBBoxQuery_(bboxFieldName, bboxPolygon));
	filter_.push(vk2.request.ElasticSearch.createFacetQuery_(facets));
	filter_.push(vk2.request.ElasticSearch.createGeorefTrueQuery_());
	
	// now append the sorting expression
	query_["query"]["filtered"]["filter"]["bool"]["must"] = filter_;
	query_["sort"][sortFieldName] = { "order": sortValue };
	
	return query_;
};

/**
 * Function builds a query to fetch records from the server which are not georeference yet.
 * 
 * @static
 * @param {string} timeFieldName
 * @param {Array.<string>} timeValues | Must be [start (1900-01-01), end (1905-01-01)]
 * @param {string} sortFieldName
 * @param {string} sortValue | Must be {asc|desc}
 * @param {Array.<Object>} facets
 * @return {Object}
 */
vk2.request.ElasticSearch.getToGeorefQuery = function(timeFieldName, timeValues, sortFieldName, sortValue, facets){
	
	// this is the basic structure of the query
	var filter_ = [],
		query_ = vk2.request.ElasticSearchQuery();
	
	// now create the logical filter
	filter_.push(vk2.request.ElasticSearch.createRangeQuery_(timeFieldName, timeValues));
	filter_.push(vk2.request.ElasticSearch.createFacetQuery_(facets));
	filter_.push(vk2.request.ElasticSearch.createGeorefFalseQuery_());
	
	// now append the sorting expression
	query_["query"]["filtered"]["filter"]["bool"]["must"] = filter_;
	query_["sort"][sortFieldName] = { "order": sortValue };
	
	return query_;
};


/**
 * The function returns the requests url for getting
 * feature record for a given id.
 * 
 * @param {string} type
 * @param {string} featureid
 * @return {string}
 */
vk2.request.ElasticSearch.getFeatureForId = function(type, featureId){
	return vk2.settings.ELASTICSEARCH_NODE + '/' + type + '/' + featureId;
};

/**
 * The function returns the requests url for getting
 * feature records for a given ids.
 * 
 * @param {string} type
 * @param {Array.<string>} featureIds
 * @return {Object}
 */
vk2.request.ElasticSearch.getFeatureForIds = function(type, featureIds, callback){
	var url =  vk2.settings.ELASTICSEARCH_NODE + '/' + type + '/_mget',
		payload = JSON.stringify({'ids':featureIds});
	
	// send request
	goog.net.XhrIo.send(url, callback, 'POST', payload);
};

/**
 * Function returns a elasticseach query for querying all features with a specific
 * id.
 * 
 * @param {string} idFieldName
 * @param {Array.<number>} ids
 * @return {Object}
 * @deprecated
 */
vk2.request.ElasticSearch.getFeaturesForIdsFilterQuery = function(idFieldName, ids){
	
	// this is the basic structure of the query
	var filter_ = [];
	var query_ = {
		"query": {
			"filtered": {
				"filter": {
					"bool": {
						"should": filter_
					}
				}
			}
		}
	};
	
	for (var i = 0, ii = ids.length; i < ii; i++){
		var term_ = { "term": {} };
		term_["term"][idFieldName] = ids[i];
		filter_.push(term_);
	};
	
	return query_; 
};
