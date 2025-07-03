/*
 * Created by tom.schulze@pikobytes.de on 27.06.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { arc as d3Arc, pie as d3Pie } from "d3-shape";
import { select as d3Select } from "d3-selection";

const baseSvgs = {};
const svgNamespace = "http://www.w3.org/2000/svg";

if (typeof document !== "undefined") {
    baseSvgs.svg = document.createElementNS(svgNamespace, "svg");
    baseSvgs.arcs = document.createElementNS(svgNamespace, "g");
    baseSvgs.arcs.classList.add("arcs");
    baseSvgs.circle = document.createElementNS(svgNamespace, "circle");
    baseSvgs.circle.classList.add("circle");
}

const OUTERMOST_RADIUS = 45;

const createBlurCircle = (spatialCertainty, maxRadius) => {
    const minRadius = 7;
    const maxModifier = maxRadius - minRadius - 4;

    const blurRadius = minRadius + (1 - spatialCertainty) * maxModifier;
    const blurAmount = Math.round((1 - spatialCertainty) * 7);

    const blurCircleNode = baseSvgs.circle.cloneNode();
    blurCircleNode.setAttribute("r", blurRadius);
    blurCircleNode.style.setProperty(
        "--idohist-spatial-blur",
        `${blurAmount}px`
    );

    blurCircleNode.classList.add("spatial-certainty");
    return blurCircleNode;
};

const createBackgroundCircle = () => {
    const circleNode = baseSvgs.circle.cloneNode();
    circleNode.setAttribute("r", OUTERMOST_RADIUS);

    circleNode.classList.add("background");
    return circleNode;
};

const createTrackCircle = (radius) => {
    const circleNode = baseSvgs.circle.cloneNode();
    circleNode.setAttribute("r", radius);

    circleNode.classList.add("track");
    return circleNode;
};

export const createIdohistSvg = ({
    spatialCertainty,
    temporalCertainty,
    contentCertainty,
}) => {
    const svgSize = OUTERMOST_RADIUS * 2;

    const paddingOuter = 5;
    const paddingBetween = 3;
    const width = 6;

    const outerArcOuter = OUTERMOST_RADIUS - paddingOuter;
    const outerArcInner = outerArcOuter - width;
    const innerArcOuter = outerArcInner - paddingBetween;
    const innerArcInner = innerArcOuter - width;

    const trackInner = createTrackCircle(
        innerArcOuter - (innerArcOuter - innerArcInner) / 2
    );
    const trackOuter = createTrackCircle(
        outerArcOuter - (outerArcOuter - outerArcInner) / 2
    );

    const blurCircleNode = createBlurCircle(spatialCertainty, innerArcInner);
    const backgroundCircle = createBackgroundCircle();

    const svgNode = baseSvgs.svg.cloneNode();
    const temporalArcsNode = baseSvgs.arcs.cloneNode();
    temporalArcsNode.classList.add("temporal");
    const contentArcsNode = baseSvgs.arcs.cloneNode();
    contentArcsNode.classList.add("content");

    const data = {
        content: [
            { value: contentCertainty, cssClass: "certainty" },
            {
                value: 1 - contentCertainty,
                cssClass: "uncertainty",
            },
        ],
        temporal: [
            { value: temporalCertainty, cssClass: "certainty" },
            { value: 1 - temporalCertainty, cssClass: "uncertainty" },
        ],
    };

    const outerArc = d3Arc()
        .innerRadius(outerArcOuter)
        .outerRadius(outerArcInner);

    const innerArc = d3Arc()
        .innerRadius(innerArcInner)
        .outerRadius(innerArcOuter);

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

    svgNode.setAttribute(
        "viewBox",
        `${-svgSize / 2}, ${-svgSize / 2}, ${svgSize}, ${svgSize}`
    );

    svgNode.append(
        backgroundCircle,
        blurCircleNode,
        trackInner,
        trackOuter,
        temporalArcsNode,
        contentArcsNode
    );

    return svgNode;
};
