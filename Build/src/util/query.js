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
 * The function creates a elasticsearch query, which query an index with
 * a boundingbox and a time range filter. The spatial data in the index is
 * in WGS84 meaning EPSG:4326.
 *
 * @static
 * @param {object} options
 * @param {string} options.timePeriodStartFieldName
 * @param {string} options.timePeriodEndFieldName
 * @param {Array.<string>} options.timeValues | Must be [start (1900-01-01), end (1905-01-01)]
 * @param {string} options.bboxFieldName
 * @param {Array.<number>} options.bboxPolygon
 * @param {string} options.sortFieldName
 * @param {string} options.sortValue | Must be {asc|desc}
 * @param {Array.<Object>} options.facets
 * @param {Array.<Object>} options.customQueryExtension
 * @return {Object}
 */
export const getSpatialQuery = function ({
    timePeriodStartFieldName,
    timePeriodEndFieldName,
    timeValues,
    bboxFieldName,
    bboxPolygon,
    sortFieldName,
    sortValue,
    facets,
    customQueryExtension,
}) {
    // now append the sorting expression
    const [start, end] = timeValues;
    return {
        query: {
            bool: {
                filter: [
                    {
                        range: {
                            [timePeriodStartFieldName]: { lte: end },
                        },
                    },
                    {
                        range: {
                            [timePeriodEndFieldName]: { gte: start },
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
                    ...(customQueryExtension || []),
                ],
                must: [{ match_all: {} }],
            },
        },
        sort: {
            [sortFieldName]: { order: sortValue },
        },
    };
};
