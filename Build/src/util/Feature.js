/**
 * Created by nicolas.looschen@pikobytes.de on 10.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

export class Feature {
    constructor({ properties, geometry }) {
        this.properties = properties;
        this.geometry = geometry;
    }

    getId() {
        return this.properties.id;
    }

    toGeoJSON() {
        return {
            type: "Feature",
            properties: this.properties,
            geometry: this.geometry,
        };
    }

    getGeometry() {
        return this.geometry;
    }

    get(property) {
        return this.properties[property];
    }

    getSourceId() {
        return this.getId() ?? this.get("title");
    }

    isDisplayedInMap(map) {
        return map.getSource(this.getSourceId()) !== undefined;
    }
}
