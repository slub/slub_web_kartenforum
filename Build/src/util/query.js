/**
 * Created by nicolas.looschen@pikobytes.de on 10/20/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

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

export const createMinMaxYearQuery = function (
    timePeriodFieldStartName,
    timePeriodFieldEndName
) {
    return {
        aggs: {
            minYear: {
                min: { field: timePeriodFieldStartName },
            },
            maxYear: {
                max: { field: timePeriodFieldEndName },
            },
        },
    };
};

/**
 * Creates a geo_shape es filter, which allows the combination of multiple geo_shape polygones via boolean or filter
 * @param {string} geometrySearchFieldName
 * @param {Array<Array<Array<Array<number, number>>>>} geometrySearchPolygons
 * @returns {Object}
 * @private
 */
const createGeoShapeQuery_ = function (
    geometrySearchFieldName,
    geometrySearchPolygons
) {
    const geoShapeFilters = geometrySearchPolygons.map((polygon) => ({
        geo_shape: {
            [geometrySearchFieldName]: {
                relation: "intersects",
                shape: {
                    type: "polygon",
                    coordinates: polygon,
                },
            },
        },
    }));
    return { bool: { should: geoShapeFilters } };
};

/**
 * Creates a range filter for one side of a time period, which also matches documents
 * without a value for the field. A missing value is an open (unbounded) side of the
 * time period and counts as -infinity / +infinity.
 * @param {string} fieldName
 * @param {Object} range - Range condition, e.g. `{ lte: '1900-12-31' }`
 * @returns {Object}
 * @private
 */
const createOpenEndedRangeQuery_ = function (fieldName, range) {
    return {
        bool: {
            minimum_should_match: 1,
            should: [
                { range: { [fieldName]: range } },
                { bool: { must_not: { exists: { field: fieldName } } } },
            ],
        },
    };
};

// Sort field which sorts the results by the relevance score of the script score function
export const SORT_FIELD_SCORE = "_score";

/**
 * Creates a function_score query, which ranks the results of the given query by relevance
 * @param {Object} query - Query which filters the results.
 * @param {Object} params - Parameters for the script score function.
 * @returns {Object}
 * @private
 */
const createRelevanceQuery_ = function (
    query,
    { optimalResolution, center, maxDistance, searchArea, medianMapResolution }
) {
    return {
        function_score: {
            query,
            boost_mode: "replace", // don't use scores from search
            script_score: {
                script: {
                    params: {
                        maxDistance,
                        optimalResolution,
                        lat: center.lat,
                        lng: center.lng,
                        medianMapResolution,
                        searchArea,
                    },

                    source: `
                        double calcScoreExp(double value, double origin) {
                            double scale = Math.max(origin / 2, 1e-6);
                            double decay = 0.5; // the score at the scale value
                            double offset = 0;

                            double lambda = Math.log(decay) / scale;
                            return Math.exp(lambda * Math.max(0, Math.abs(value - origin) - offset));
                        }

                        double calcScoreExpNoOptimum(double value, double origin) {
                            double scale = Math.max(origin, 1e-6);
                            double decay = 0.25; // the score at the scale value

                            double lambda = Math.log(decay) / scale;
                            return Math.exp(lambda * value);
                        }
 
                        /////// DISTANCE SCORE ////////////
                        // cap max distance to viewport
                        double distance = doc['center'].arcDistance(params.lat, params.lng);
                        double distance_score = calcScoreExpNoOptimum(distance, params.maxDistance);
                        
                        /////// AREA SCORE ////////////////
                        double area = doc['area'].value;
                        double area_optimal = params.searchArea;
                        double area_score = calcScoreExp(area, area_optimal);
                        
                        /////// RESOLUTION SCORE //////////
                        double r_optimal = params.optimalResolution;
                        
                        // vector maps have no resolution: use the median map resolution,
                        // or 0 if the map is much smaller/larger than the search area (results in a res_score of 0.25)

                        double r_map = 0;
                        if (doc['type'].value == "vector") {
                            double area_ratio = area / area_optimal;
                            boolean is_off_scale = area_ratio < 0.01 || area_ratio > 4.3;
                            r_map = is_off_scale ? 0 : params.medianMapResolution;
                        } else {
                            r_map = doc['map_resolution'].value;
                        }

                        double res_score = calcScoreExp(r_map,r_optimal);
                        

                        ////// ZOOM-BASED FINAL SCORE ///////
                        
                        if (r_optimal > 800) {
                            return area_score;
                        } 
                        
                        if (r_optimal > 150) {
                            return area_score * 0.8 + distance_score * 0.2;
                        }
                            
                        return (area_score + res_score + distance_score) / 3;
                        `,
                },
            },
        },
    };
};

/**
 * Creates an Elasticsearch query that searches an index using a bounding box
 * and a time range filter. The spatial data in the index is expected to be in
 * WGS84 (EPSG:4326).
 *
 * The time range filter keeps documents whose time period overlaps the given range. A
 * time period may be open on one side (the start or end field is missing); an open side
 * counts as -infinity / +infinity.
 *
 * If `sortFieldName` is `SORT_FIELD_SCORE`, the results are ranked by the script score
 * function (descending, ties sorted by title). Otherwise they are sorted by the given field.
 *
 * @static
 * @param {Object} options - Query options.
 * @param {string} options.timePeriodStartFieldName - Name of the field holding the start of the time period.
 * @param {string} options.timePeriodEndFieldName - Name of the field holding the end of the time period.
 * @param {string[]} options.timeValues - Time range as `[start, end]`, e.g. `['1900-01-01', '1905-01-01']`.
 * @param {string} options.geometrySearchFieldName - Name of the geometry field to search.
 * @param {number[][][][]} options.geometrySearchPolygons - Search polygons as nested coordinate arrays (polygons → rings → points → `[lng, lat]`).
 * @param {string} options.sortFieldName - Name of the field to sort by, or `SORT_FIELD_SCORE` for sorting by relevance.
 * @param {('asc'|'desc')} options.sortValue - Sort direction. Ignored when sorting by relevance.
 * @param {string} options.mapResolutionFieldName - Name of the map resolution field.
 * @param {Object[]} options.facets - Facet (aggregation) definitions.
 * @param {Object[]} options.customQueryExtension - Additional query clauses to merge into the query.
 * @param {Object} options.scriptScoreParams - Parameters for the script score function.
 * @param {number} options.scriptScoreParams.optimalResolution - Optimal map resolution.
 * @param {Object} options.scriptScoreParams.center - Center of the search area.
 * @param {number} options.scriptScoreParams.center.lat - Latitude of the center.
 * @param {number} options.scriptScoreParams.center.lng - Longitude of the center.
 * @param {number} options.scriptScoreParams.maxDistance - Maximum distance from the center.
 * @param {number} options.scriptScoreParams.searchArea - Size of the search area.
 * @param {number} options.scriptScoreParams.medianMapResolution - Median map resolution.
 * @returns {Object} The Elasticsearch query object.
 */
export const getSpatialQuery = function ({
    timePeriodStartFieldName,
    timePeriodEndFieldName,
    timeValues,
    geometrySearchFieldName,
    geometrySearchPolygons,
    sortFieldName,
    sortValue,
    facets,
    customQueryExtension,
    mapResolutionFieldName,
    scriptScoreParams,
}) {
    const [start, end] = timeValues;
    const filterQuery = {
        bool: {
            filter: [
                // periods are intersecting when (start_map <= end) AND (end_map >= start)
                createOpenEndedRangeQuery_(timePeriodStartFieldName, {
                    lte: end,
                }),
                createOpenEndedRangeQuery_(timePeriodEndFieldName, {
                    gte: start,
                }),
                createGeoShapeQuery_(
                    geometrySearchFieldName,
                    geometrySearchPolygons
                ),
                createFacetQuery_(facets),
                { term: { has_georeference: true } },
                ...(customQueryExtension || []),
            ],
        },
    };
    const isRelevanceSort = sortFieldName === SORT_FIELD_SCORE;

    return {
        query: isRelevanceSort
            ? createRelevanceQuery_(filterQuery, scriptScoreParams)
            : filterQuery,
        // for field sorts, documents without a value (e.g. an open time period start) are sorted last in both directions
        sort: isRelevanceSort
            ? [
                  { [SORT_FIELD_SCORE]: { order: "desc" } },
                  { title: { order: "asc" } },
              ]
            : { [sortFieldName]: { order: sortValue, missing: "_last" } },
        // the median is also needed for field sorts, so that it is up to date when switching to relevance
        aggs: {
            medianMapResolution: {
                percentiles: {
                    field: mapResolutionFieldName,
                    percents: [50],
                },
            },
        },
    };
};
