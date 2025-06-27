/*
 * Created by tom.schulze@pikobytes.de on 22.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { Marker } from "maplibre-gl";
import { arc as d3Arc, pie as d3Pie } from "d3-shape";
import { select as d3Select } from "d3-selection";
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

const baseSvgs = {};
const svgNamespace = "http://www.w3.org/2000/svg";

if (typeof document !== "undefined") {
    baseSvgs.svg = document.createElementNS(svgNamespace, "svg");
    baseSvgs.arcs = document.createElementNS(svgNamespace, "g");
    baseSvgs.arcs.classList.add("arcs");
    baseSvgs.circle = document.createElementNS(svgNamespace, "circle");
    baseSvgs.circle.classList.add("circle");
}

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

const createIdohistSvg = ({
    spatialCertainty,
    temporalCertainty,
    contentCertainty,
}) => {
    const size = 75;
    const radius = size / 2;

    const svgNode = baseSvgs.svg.cloneNode();
    const temporalArcsNode = baseSvgs.arcs.cloneNode();
    temporalArcsNode.classList.add("temporal");
    const contentArcsNode = baseSvgs.arcs.cloneNode();
    contentArcsNode.classList.add("content");
    const circleNode = baseSvgs.circle.cloneNode();
    circleNode.setAttribute("r", radius - 12 - 4);

    if (spatialCertainty === 1) {
        circleNode.classList.add("certain");
    } else {
        circleNode.classList.add("uncertain");
    }

    svgNode.append(circleNode, temporalArcsNode, contentArcsNode);
    svgNode.setAttribute(
        "viewBox",
        `${-size / 2}, ${-size / 2}, ${size}, ${size}`
    );

    const data = {
        content: [
            { value: contentCertainty, cssClass: "certainty" },
            { value: 1 - contentCertainty, cssClass: "uncertainty" },
        ],
        temporal: [
            { value: temporalCertainty, cssClass: "certainty" },
            { value: 1 - temporalCertainty, cssClass: "uncertainty" },
        ],
    };

    const outerArc = d3Arc()
        .innerRadius(radius - 5)
        .outerRadius(radius);

    const innerArc = d3Arc()
        .innerRadius(radius - 12)
        .outerRadius(radius - 7);

    const pie = d3Pie()
        .sort(null)
        .value((d) => d.value);

    const contentArcs = d3Select(contentArcsNode);
    const temporalArcs = d3Select(temporalArcsNode);

    contentArcs
        .selectAll()
        .data(pie(data.content))
        .enter()
        .append("path")
        .attr("d", outerArc)
        .attr("class", (d) => d.data.cssClass);

    temporalArcs
        .selectAll()
        .data(pie(data.temporal))
        .enter()
        .append("path")
        .attr("d", innerArc)
        .attr("class", (d) => d.data.cssClass);

    return svgNode;
};

export const createIdohistMarker = (feature, { sourceId, sourceIdHover }) => {
    const position = feature.geometry.coordinates;
    const featureId = feature.id;
    const { properties } = feature;

    const contentCertainty = properties[IDOHIST_FEATURE_PROPS.contentCertainty];
    const temporalCertainty =
        properties[IDOHIST_FEATURE_PROPS.temporalCertainty];
    const spatialCertainty = properties[IDOHIST_FEATURE_PROPS.spatialCertainty];

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
    steep: {
        slope: 0.08,
        intercept: 0.02,
    },
    gradual: {
        slope: 0.025,
        intercept: 0.55,
    },
};

export const calculateIdohistMarkerScaleFactor = (zoomLevel) => {
    if (zoomLevel < 10) {
        return (
            scaleFactorParams.steep.slope * zoomLevel +
            scaleFactorParams.steep.intercept
        );
    }

    return (
        scaleFactorParams.gradual.slope * zoomLevel +
        scaleFactorParams.gradual.intercept
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
