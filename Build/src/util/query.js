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

        searchTerm_["term"][facet_["key"]] = facet_["value"].toUpperCase();
        facetsFilter_.push(searchTerm_);
    }
    return facets_;
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
    // now append the sorting expression
    return {
        query: {
            bool: {
                filter: [
                    {
                        range: {
                            [timeFieldName]: {
                                gte: timeValues[0],
                                lte: timeValues[1],
                            },
                        },
                    },
                    {
                        geo_shape: {
                            [bboxFieldName]: {
                                relation: "intersects",
                                shape: {
                                    type: "envelope",
                                    coordinates: bboxPolygon,
                                },
                            },
                        },
                    },
                    createFacetQuery_(facets),
                    { term: { has_georeference: true } },
                ],
                must: [{ match_all: {} }],
            },
        },
        sort: {
            [sortFieldName]: { order: sortValue },
        },
    };
};
