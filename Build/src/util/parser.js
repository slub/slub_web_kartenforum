/**
 * Created by nicolas.looschen@pikobytes.de on 10/20/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import {
    GeoJsonLayer,
    HistoricMapLayer,
    LAYER_TYPES,
    METADATA,
} from "@map/components/CustomLayers";
import { emptyFeatureCollection } from "@map/components/GeoJson/constants";

/**
 * Function parses a search record from an elasticsearch query into
 * an application layer instance.
 *
 * @static
 * @param {string} id
 * @param {Object} record
 * @return {HistoricMapLayer}
 */
export const readLayer = function (id, record) {
    const geometry = "geometry" in record ? record["geometry"] : undefined;
    // a missing date is an open side of the time period
    const time_period = [
        record["time_period_start"] ?? null,
        record["time_period_end"] ?? null,
    ];

    delete record["geometry"];
    delete record["time_period_start"];
    delete record["time_period_end"];

    const properties = { ...record };

    properties["id"] = id;
    properties[METADATA.timePeriod] = time_period;

    const type = properties["type"];

    if (type === LAYER_TYPES.VECTOR_MAP) {
        properties[METADATA.vectorMapId] = id;
        return GeoJsonLayer.fromPersistence({
            geometry,
            metadata: properties,
            geoJson: structuredClone(emptyFeatureCollection),
        });
    }

    return new HistoricMapLayer({ metadata: properties, geometry });
};

/**
 * Parses an array of search records from an elasticsearch query into
 * an array of application layer instances.
 *
 * @static
 * @param {Array.<Object>} records
 * @return {Array.<HistoricMapLayer>}
 */
export const readLayers = function (records) {
    const features = [];
    for (let i = 0, ii = records.length; i < ii; i++) {
        features.push(readLayer(records[i]["_id"], records[i]["_source"]));
    }

    return features;
};

/**
 * Maps the time period of a mosaic map (years, `null` for an open side) to
 * the start and end year used by the input panel.
 */
export const readMosaicMap = (mosaicMap) => {
    const { time_period, ...rest } = mosaicMap;
    const [time_period_start, time_period_end] = time_period;

    return {
        time_period_start,
        time_period_end,
        ...rest,
    };
};

const _toYear = (year) => {
    if (year === undefined || year === null || Number.isNaN(year)) {
        return null;
    }

    return year;
};

/**
 * Maps the start and end year of the input panel to the time period of a
 * mosaic map. An empty year is sent as `null` (open side).
 */
export const serializeMosaicMap = (mosaicMap) => {
    const { time_period_start, time_period_end, ...rest } = mosaicMap;

    return {
        time_period: [_toYear(time_period_start), _toYear(time_period_end)],
        ...rest,
    };
};
