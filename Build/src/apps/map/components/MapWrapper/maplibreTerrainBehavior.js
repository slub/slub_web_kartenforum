/**
 * Created by nicolas.looschen@pikobytes.de on 06.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { Map } from "maplibre-gl";
import { bindAll, DOMcreate, DOMremove } from "./tools.js";
import CustomEvents from "./customEvents.js";

const terrainUrl = "https://tiles-experimental.pikotest.dev/{z}/{x}/{y}.png";
export const TERRAIN_SOURCE_ID = "vkf-terrain";
export const TERRAIN_HILLSHADE_SOURCE_ID = "vkf-hillshade";

export class CustomMap extends Map {
    terrainExaggeration = 1;
    isTerrainEnabled = false;

    addLayer(layer, beforeId) {
        const result = super.addLayer(layer, beforeId);
        this.fire(CustomEvents.layerAdded, { layerId: layer.id });

        return result;
    }

    /**
     * Get the exaggeration factor applied to the terrain
     * @returns
     */
    getTerrainExaggeration() {
        return this.terrainExaggeration;
    }

    /**
     * Know if terrian is enabled or not
     * @returns
     */
    hasTerrain() {
        return this.isTerrainEnabled;
    }

    growTerrain(exaggeration, durationMs = 1000) {
        // This method assumes the terrain is already built
        if (!this.terrain) {
            return;
        }

        const startTime = performance.now();
        // This is supposedly 0, but it could be something else (e.g. already in the middle of growing, or user defined other)
        const currentExaggeration = this.terrain.exaggeration;
        const deltaExaggeration = exaggeration - currentExaggeration;

        // This is again called in a requestAnimationFrame ~loop, until the terrain has grown enough
        // that it has reached the target
        const updateExaggeration = () => {
            if (!this.terrain) {
                return;
            }

            // If the flattening animation is triggered while the growing animation
            // is running, then the flattening animation is stopped
            if (this.terrainFlattening) {
                return;
            }

            // normalized value in interval [0, 1] of where we are currently in the animation loop
            const positionInLoop = (performance.now() - startTime) / durationMs;

            // The animation goes on until we reached 99% of the growing sequence duration
            if (positionInLoop < 0.99) {
                const exaggerationFactor = 1 - (1 - positionInLoop) ** 4;
                const newExaggeration =
                    currentExaggeration +
                    exaggerationFactor * deltaExaggeration;
                this.terrain.exaggeration = newExaggeration;
                requestAnimationFrame(updateExaggeration);
            } else {
                this.terrainGrowing = false;
                this.terrainFlattening = false;
                this.terrain.exaggeration = exaggeration;
            }

            // When growing the terrain, this is only necessary before rendering
            this._elevationFreeze = false;
            this.triggerRepaint();
        };

        this.terrainGrowing = true;
        this.terrainFlattening = false;
        requestAnimationFrame(updateExaggeration);
    }

    /**
     * Enables the 3D terrain visualization
     */
    enableTerrain(exaggeration = this.terrainExaggeration) {
        if (exaggeration < 0) {
            console.warn("Terrain exaggeration cannot be negative.");
            return;
        }

        // This function is mapped to a map "data" event. It checks that the terrain
        // tiles are loaded and when so, it starts an animation to make the terrain grow
        const dataEventTerrainGrow = async (evt) => {
            if (!this.terrain) {
                return;
            }

            if (
                evt.type !== "data" ||
                evt.dataType !== "source" ||
                !("source" in evt)
            ) {
                return;
            }

            if (evt.sourceId !== TERRAIN_SOURCE_ID) {
                return;
            }

            const source = evt.source;

            if (source.type !== "raster-dem") {
                return;
            }

            if (!evt.isSourceLoaded) {
                return;
            }

            // We shut this event off because we want it to happen only once.
            // Yet, we cannot use the "once" method because only the last event of the series
            // has `isSourceLoaded` true
            this.off("data", dataEventTerrainGrow);

            this.growTerrain(exaggeration);
        };

        // This is put into a function so that it can be called regardless
        // of the loading state of _this_ the map instance
        const addTerrain = () => {
            // When style is changed,
            this.isTerrainEnabled = true;
            this.terrainExaggeration = exaggeration;

            // Mapping it to the "data" event so that we can check that the terrain
            // growing starts only when terrain tiles are loaded (to reduce glitching)
            this.on("data", dataEventTerrainGrow);

            this.addSource(TERRAIN_SOURCE_ID, {
                type: "raster-dem",
                tiles: [terrainUrl],
                tileSize: 256,
                minzoom: 0,
                maxzoom: 12,
                encoding: "terrarium",
            });

            // this.addSource(TERRAIN_HILLSHADE_SOURCE_ID, {
            //     type: "raster-dem",
            //     tiles: [terrainUrl],
            //     tileSize: 256,
            //     minzoom: 0,
            //     maxzoom: 12,
            //     encoding: "terrarium",
            // });

            // this.addLayer({
            //     id: TERRAIN_HILLSHADE_SOURCE_ID,
            //     type: "hillshade",
            //     source: TERRAIN_HILLSHADE_SOURCE_ID,
            //     layout: { visibility: "visible" },
            //     paint: { "hillshade-shadow-color": "#473B24" },
            // });

            // // Optionally add a sky layer for better visualization
            // this.setSky({
            //     "sky-type": "atmosphere",
            //     "sky-atmosphere-sun": [0.0, 0.0],
            //     "sky-atmosphere-sun-intensity": 15,
            // });

            // Setting up the terrain with a 0 exaggeration factor
            // so it loads ~seamlessly and then can grow from there
            this.setTerrain({
                source: TERRAIN_SOURCE_ID,
                exaggeration: 0,
            });
        };

        // The terrain has already been loaded,
        // we just update the exaggeration.
        if (this.getTerrain()) {
            this.isTerrainEnabled = true;
            this.growTerrain(exaggeration);
            return;
        }

        if (this.loaded() || this.isTerrainEnabled) {
            addTerrain();
        } else {
            this.once("load", () => {
                if (this.getTerrain() && this.getSource(TERRAIN_SOURCE_ID)) {
                    return;
                }
                addTerrain();
            });
        }
    }

    /**
     * Disable the 3D terrain visualization
     */
    disableTerrain() {
        // It could be disabled already
        if (!this.terrain) {
            return;
        }

        this.isTerrainEnabled = false;
        // this.stopFlattening = false;

        // Duration of the animation in millisec
        const animationLoopDuration = 1 * 1000;
        const startTime = performance.now();
        // This is supposedly 0, but it could be something else (e.g. already in the middle of growing, or user defined other)
        const currentExaggeration = this.terrain.exaggeration;

        // This is again called in a requestAnimationFrame ~loop, until the terrain has grown enough
        // that it has reached the target
        const updateExaggeration = () => {
            if (!this.terrain) {
                return;
            }

            // If the growing animation is triggered while flattening,
            // then we exist the flatening
            if (this.terrainGrowing) {
                return;
            }

            // normalized value in interval [0, 1] of where we are currently in the animation loop
            const positionInLoop =
                (performance.now() - startTime) / animationLoopDuration;

            // At disabling, this should be togled fo both the setTerrain() (at the end of the animation)
            // and also just before triggerRepain(), this is why we moved it this high
            this._elevationFreeze = false;

            // The animation goes on until we reached 99% of the growing sequence duration
            if (positionInLoop < 0.99) {
                const exaggerationFactor = (1 - positionInLoop) ** 4;
                const newExaggeration =
                    currentExaggeration * exaggerationFactor;
                this.terrain.exaggeration = newExaggeration;
                requestAnimationFrame(updateExaggeration);
            } else {
                this.terrain.exaggeration = 0;
                this.terrainGrowing = false;
                this.terrainFlattening = false;

                this.setTerrain();
                if (this.getSource(TERRAIN_SOURCE_ID)) {
                    this.removeSource(TERRAIN_SOURCE_ID);
                }
            }

            this.triggerRepaint();
        };

        this.terrainGrowing = false;
        this.terrainFlattening = true;
        requestAnimationFrame(updateExaggeration);
    }

    /**
     * Sets the 3D terrain exageration factor.
     * If the terrain was not enabled prior to the call of this method,
     * the method `.enableTerrain()` will be called.
     * If `animate` is `true`, the terrain transformation will be animated in the span of 1 second.
     * If `animate` is `false`, no animated transition to the newly defined exaggeration.
     */
    setTerrainExaggeration(exaggeration, animate = true) {
        if (!animate && this.terrain) {
            this.terrainExaggeration = exaggeration;
            this.terrain.exaggeration = exaggeration;
            this.triggerRepaint();
        } else {
            this.enableTerrain(exaggeration);
        }
    }
}

/**
 * A `MaptilerTerrainControl` control adds a button to turn terrain on and off
 * by triggering the terrain logic that is already deployed in the Map object.
 */
export class TerrainControl {
    _map;
    _container;
    _terrainButton;

    constructor() {
        bindAll(["_toggleTerrain", "_updateTerrainIcon"], this);
    }

    onAdd(map) {
        this._map = map;
        this._container = DOMcreate(
            "div",
            "maplibregl-ctrl maplibregl-ctrl-group"
        );
        this._terrainButton = DOMcreate(
            "button",
            "maplibregl-ctrl-terrain",
            this._container
        );
        DOMcreate(
            "span",
            "maplibregl-ctrl-icon",
            this._terrainButton
        ).setAttribute("aria-hidden", "true");
        this._terrainButton.type = "button";
        this._terrainButton.addEventListener("click", this._toggleTerrain);

        this._updateTerrainIcon();
        this._map.on("terrain", this._updateTerrainIcon);
        return this._container;
    }

    onRemove() {
        DOMremove(this._container);
        this._map.off("terrain", this._updateTerrainIcon);
        // @ts-expect-error: map will only be undefined on remove
        this._map = undefined;
    }

    _toggleTerrain() {
        if (this._map.hasTerrain()) {
            this._map.disableTerrain();
        } else {
            this._map.enableTerrain();
        }

        this._updateTerrainIcon();
    }

    _updateTerrainIcon() {
        this._terrainButton.classList.remove("maplibregl-ctrl-terrain");
        this._terrainButton.classList.remove("maplibregl-ctrl-terrain-enabled");
        // if (this._map.terrain) {
        if (this._map.hasTerrain()) {
            this._terrainButton.classList.add(
                "maplibregl-ctrl-terrain-enabled"
            );
            this._terrainButton.title = this._map._getUIString(
                "TerrainControl.Disable"
            );
        } else {
            this._terrainButton.classList.add("maplibregl-ctrl-terrain");
            this._terrainButton.title = this._map._getUIString(
                "TerrainControl.Enable"
            );
        }
    }
}
