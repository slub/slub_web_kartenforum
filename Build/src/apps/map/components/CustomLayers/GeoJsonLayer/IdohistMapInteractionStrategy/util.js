/*
 * Created by tom.schulze@pikobytes.de on 22.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { Marker } from "maplibre-gl";

import { mapState, selectedGeoJsonFeatureIdentifierState } from "@map/atoms";
import {
    setRecoilStateExternally,
    getRecoilStateExternallyAsync,
} from "@components/RecoilExternal";
import {
    defaultHoverFilters,
    IDOHIST_FEATURE_PROPS,
    IDOHIST_HOVER_LAYER_DEFINITIONS,
} from "./constants";
import { isDefined } from "@util/util";
import {
    EXTERNAL_CONTENT_TYPES,
    MAP_LIBRE_METADATA,
    VISIBILITY,
} from "../../constants";
import { createIdohistSvg } from "./svgMarker";

const MARKER_CLASS = "marker-idohist";
const DATA_ATTR_FEATURE_ID = "data-vkf-feature-id";
const DATA_ATTR_SOURCE_ID = "data-vkf-source-id";
const DATA_ATTR_SOURCE_ID_HOVER = "data-vkf-source-id-hover";
export const DATA_ATTR_VISIBILITY = "data-vkf-visibility";
export const FEATURE_PROPS_SYMBOL = Symbol("vkf:feature-properties");
const EMPTY_HOVER_GEOMETRY = {
    type: "Polygon",
    coordinates: [],
};

const baseDivElement =
    typeof document !== "undefined" ? document.createElement("div") : {};

const getAttributesFromTarget = (target) => {
    if (!isDefined(target)) {
        return;
    }

    const markerDiv = target.closest(`div.${MARKER_CLASS}`);
    const featureId = parseInt(
        markerDiv.getAttribute(DATA_ATTR_FEATURE_ID),
        10
    );
    const sourceId = markerDiv.getAttribute(DATA_ATTR_SOURCE_ID);
    const sourceIdHover = markerDiv.getAttribute(DATA_ATTR_SOURCE_ID_HOVER);
    const visibility = markerDiv.getAttribute(DATA_ATTR_VISIBILITY);

    return { featureId, sourceId, sourceIdHover, visibility };
};

const toggleHoverPolygon = (map, sourceIdHover, featureId) => {
    if (!isDefined(map)) {
        return;
    }

    const styleLayers = Object.keys(IDOHIST_HOVER_LAYER_DEFINITIONS).map(
        (layerType) => `${sourceIdHover}-${layerType}`
    );

    for (const layerId of styleLayers) {
        if (!isDefined(featureId)) {
            map.setFilter(layerId, defaultHoverFilters);
            continue;
        }

        const filters = [
            "all",
            defaultHoverFilters[1],
            ["==", ["id"], featureId],
        ];
        map.setFilter(layerId, filters);
    }
};

const clickHandler = (event) => {
    event.stopPropagation();
    const { target } = event;
    const { featureId, sourceId, visibility } = getAttributesFromTarget(target);

    if (visibility === VISIBILITY.NONE) {
        return;
    }

    setRecoilStateExternally(selectedGeoJsonFeatureIdentifierState, {
        featureId,
        sourceId,
    });
};

const mouseEnterHandler = (event) => {
    event.stopPropagation();
    const { target } = event;
    const { featureId, sourceIdHover, visibility } =
        getAttributesFromTarget(target);

    if (visibility === VISIBILITY.NONE) {
        return;
    }

    getRecoilStateExternallyAsync(mapState).then((map) => {
        toggleHoverPolygon(map, sourceIdHover, featureId);
    });
};

const mouseLeaveHandler = (event) => {
    event.stopPropagation();
    const { target } = event;
    const { sourceIdHover, visibility } = getAttributesFromTarget(target);

    if (visibility === VISIBILITY.NONE) {
        return;
    }

    getRecoilStateExternallyAsync(mapState).then((map) => {
        toggleHoverPolygon(map, sourceIdHover, null);
    });
};

export const createIdohistMarker = (feature, { sourceId, sourceIdHover }) => {
    const position = feature.geometry.coordinates;
    const featureId = feature.id;
    const { properties } = feature;

    const contentCertainty = coerceCertainty(
        properties[IDOHIST_FEATURE_PROPS.contentCertainty]
    );
    const temporalCertainty = coerceCertainty(
        properties[IDOHIST_FEATURE_PROPS.temporalCertainty]
    );
    const spatialCertainty = coerceCertainty(
        properties[IDOHIST_FEATURE_PROPS.spatialCertainty]
    );

    const el = baseDivElement.cloneNode();
    el.classList.add(MARKER_CLASS);
    el.setAttribute(DATA_ATTR_FEATURE_ID, featureId);
    el.setAttribute(DATA_ATTR_SOURCE_ID, sourceId);
    el.setAttribute(DATA_ATTR_SOURCE_ID_HOVER, sourceIdHover);

    const svgEl = createIdohistSvg({
        spatialCertainty,
        temporalCertainty,
        contentCertainty,
    });

    el.appendChild(svgEl);

    el.addEventListener("click", clickHandler);
    el.addEventListener("mouseenter", mouseEnterHandler);
    el.addEventListener("mouseleave", mouseLeaveHandler);

    const marker = new Marker({ element: el });
    marker.isVisible = true;
    marker.setLngLat(position);
    marker[FEATURE_PROPS_SYMBOL] = feature.properties;

    return marker;
};

export const createFeatureFromHoverPolygon = (feature) => {
    const { properties } = feature;
    let geometry = EMPTY_HOVER_GEOMETRY;

    if (
        Object.hasOwn(properties, IDOHIST_FEATURE_PROPS.hoverPolygon) &&
        properties[IDOHIST_FEATURE_PROPS.hoverPolygon].type === "Polygon"
    ) {
        geometry = properties[IDOHIST_FEATURE_PROPS.hoverPolygon];
    }

    return {
        type: "Feature",
        geometry,
        id: feature.id,
    };
};

export const createIdohistLayerConfig = (
    sourceId,
    styleLayerDefinitions,
    hasPopup
) => {
    const config = {};

    for (const layerType of Object.keys(styleLayerDefinitions)) {
        const layerId = `${sourceId}-${layerType}`;
        config[layerId] = {
            id: layerId,
            source: sourceId,
            ...styleLayerDefinitions[layerType],
            layout: {
                ...styleLayerDefinitions[layerType].layout,
                visibility: "visible",
            },
            ...(hasPopup && {
                metadata: {
                    [MAP_LIBRE_METADATA.id]: sourceId,
                    [MAP_LIBRE_METADATA.contentType]:
                        EXTERNAL_CONTENT_TYPES.IDOHIST,
                },
            }),
        };
    }

    return config;
};

const scaleFactorParams = {
    // f(19) = 1, f(14) = 0.8
    largeZoom: {
        slope: 0.04,
        intercept: 0.24,
    },
    // f(14) = 0.6, f(1) = 0.1
    smallZoom: {
        slope: 0.038,
        intercept: 0.06,
    },
};

export const calculateIdohistMarkerScaleFactor = (zoomLevel) => {
    if (zoomLevel > 14) {
        return (
            scaleFactorParams.largeZoom.slope * zoomLevel +
            scaleFactorParams.largeZoom.intercept
        );
    }

    return (
        scaleFactorParams.smallZoom.slope * zoomLevel +
        scaleFactorParams.smallZoom.intercept
    );
};

export const coerceCertainty = (value) => {
    if (Number.isNaN(Number.parseFloat(value))) {
        return 0;
    }

    if (value < 0) {
        return 0;
    }

    if (value > 1) {
        return 1;
    }

    return value;
};
