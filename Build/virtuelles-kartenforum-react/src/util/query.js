/**
 * Created by nicolas.looschen@pikobytes.de on 10/20/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import axios from "axios";
import { SettingsProvider } from "../index";

/**
 * @return {Object}
 */
export const ElasticSearchQuery = function () {
    return {
        query: {
            filtered: {
                filter: {
                    bool: {
                        must: [],
                    },
                },
            },
        },
        sort: {},
    };
};

/**
 * @param {string} fieldName
 * @param {Array.<number>} coordinates
 * @return {Object}
 */
export const createBBoxQuery_ = function (fieldName, coordinates) {
    const bbox_ = { geo_shape: {} };
    bbox_["geo_shape"][fieldName] = {
        relation: "intersects",
        shape: {
            type: "polygon",
            coordinates: [coordinates],
        },
    };
    return bbox_;
};

/**
 * @param {Array.<Object>} facets
 * @return {Object}
 */
export const createFacetQuery_ = function (facets) {
    const facetsFilter_ = [],
        facets_ = { bool: { should: facetsFilter_ } };

    for (let i = 0; i < facets.length; i++) {
        const facet_ = facets[i],
            searchTerm_ = { term: {} };

        searchTerm_["term"][facet_["key"]] = facet_["value"].toLowerCase();
        facetsFilter_.push(searchTerm_);
    }
    return facets_;
};

/**
 * @return {Object}
 */
export const createGeorefFalseQuery_ = function () {
    return { term: { georeference: false } };
};

/**
 * @return {Object}
 */
export const createGeorefTrueQuery_ = function () {
    return { term: { georeference: true } };
};

/**
 * @param {string} fieldName
 * @param {Array.<string>} fieldValues
 * @return {Object}
 */
export const createRangeQuery_ = function (fieldName, fieldValues) {
    const time_ = { range: {} };
    time_["range"][fieldName] = {
        gte: fieldValues[0],
        lte: fieldValues[1],
    };
    return time_;
};

/**
 * Creates a query for fetching basic statics from the search index like min, max, count, etc.
 * @param {string} stats_field
 * @return {Object}
 */
export const createStatisticQuery = function (stats_field) {
    return {
        aggs: {
            summary: {
                stats: { field: stats_field },
            },
        },
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
export const getSpatialQuery = function (
    timeFieldName,
    timeValues,
    bboxFieldName,
    bboxPolygon,
    sortFieldName,
    sortValue,
    facets
) {
    // this is the basic structure of the query
    const filter_ = [],
        query_ = ElasticSearchQuery();

    // now create the logical filter
    filter_.push(createRangeQuery_(timeFieldName, timeValues));
    filter_.push(createBBoxQuery_(bboxFieldName, bboxPolygon));
    filter_.push(createFacetQuery_(facets));
    filter_.push(createGeorefTrueQuery_());

    // now append the sorting expression
    query_["query"]["filtered"]["filter"]["bool"]["must"] = filter_;
    query_["sort"][sortFieldName] = { order: sortValue };

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
export const getToGeorefQuery = function (
    timeFieldName,
    timeValues,
    sortFieldName,
    sortValue,
    facets
) {
    // this is the basic structure of the query
    const filter_ = [],
        query_ = ElasticSearchQuery();

    // now create the logical filter
    filter_.push(createRangeQuery_(timeFieldName, timeValues));
    filter_.push(createFacetQuery_(facets));
    filter_.push(createGeorefFalseQuery_());

    // now append the sorting expression
    query_["query"]["filtered"]["filter"]["bool"]["must"] = filter_;
    query_["sort"][sortFieldName] = { order: sortValue };

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
export const getFeatureForId = function (type, featureId) {
    const settings = SettingsProvider.getSettings();

    return settings["ELASTICSEARCH_NODE"] + "/" + type + "/" + featureId;
};

/**
 * The function returns the requests url for getting
 * feature records for a given ids.
 *
 * @param {string} type
 * @param {Array.<string>} featureIds
 * @return {Object}
 */
const getFeatureForIds = function (type, featureIds, callback) {
    const settings = SettingsProvider.getSettings();

    const url = settings["ELASTICSEARCH_NODE"] + "/" + type + "/_mget",
        payload = JSON.stringify({ ids: featureIds });

    // send request
    axios.post(url, payload).then(callback);
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
export const getFeaturesForIdsFilterQuery = function (idFieldName, ids) {
    // this is the basic structure of the query
    const filter_ = [];
    const query_ = {
        query: {
            filtered: {
                filter: {
                    bool: {
                        should: filter_,
                    },
                },
            },
        },
    };

    for (let i = 0, ii = ids.length; i < ii; i++) {
        const term_ = { term: {} };
        term_["term"][idFieldName] = ids[i];
        filter_.push(term_);
    }

    return query_;
};
