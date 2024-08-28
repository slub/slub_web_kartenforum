/**
 * Created by nicolas.looschen@pikobytes.de on 06.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import GeoJSON from "ol/format/GeoJSON";

import { styleFieldSettings } from "../../../views/GeoJsonView/settings.js";
import SettingsProvider from "../../../../../SettingsProvider";
import { defaultStyleFunction } from "../../MapWrapper/getDefaultStyles.js";
import { parseGeojsonStyles } from "./geojsonParser";

/**
 * Deserializes a geojson object to an openlayers feature object
 * @param featureObject
 * @return {*}
 */
export const deserializeGeojson = (featureObject) => {
    const defaultMapView = SettingsProvider.getDefaultMapView();

    const features = new GeoJSON().readFeatures(featureObject, {
        featureProjection: defaultMapView.projection,
    });
    features.forEach((f) => {
        f.setStyle(defaultStyleFunction(f));

        parseGeojsonStyles(f);
    });

    return features;
};

/**
 * Serialize an openlayers geojson feature to a raw geojson object
 * @param features
 * @return {*}
 */
export const serializeGeojson = (features) => {
    const defaultMapView = SettingsProvider.getDefaultMapView();

    features.forEach((f) => {
        const stylingProperties = serializeGeojsonStyles(f);
        f.setProperties(stylingProperties);
    });

    return new GeoJSON().writeFeaturesObject(features, {
        featureProjection: defaultMapView.projection,
    });
};

/**
 * Serializes the styling part of an openlayers geojson feature
 * @param feature
 * @return {{}}
 */
export const serializeGeojsonStyles = (feature) => {
    const stylingProperties = {};

    Object.entries(styleFieldSettings).forEach(
        ([k, { geometryTypes, valueExtractor }]) => {
            if (geometryTypes.includes(feature.getGeometry().getType())) {
                stylingProperties[k] =
                    valueExtractor !== undefined
                        ? valueExtractor(feature.getStyle())
                        : undefined;
            }
        }
    );

    return stylingProperties;
};
