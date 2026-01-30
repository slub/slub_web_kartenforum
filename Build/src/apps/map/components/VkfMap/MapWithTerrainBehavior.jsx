/**
 * Created by nicolas.looschen@pikobytes.de on 10.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import SettingsProvider from "@settings-provider";
import { TERRAIN_SOURCE_ID } from "./constants.js";
import { flyToAsync, sleepAsync } from "./util.js";
import { Map } from "maplibre-gl";

//@TODO: Add license notice for maptiler-sdk -> Terrain behavior, fly-to-async

export const VKF_GLOBE_MODE_CHANGE_EVENT = "vkf.globemodechange";
const DEFAULT_MAX_PITCH = 60;

/**
 * Extends the Map class with an animation when enabling the terrain.
 */
export class MapWithTerrainBehavior extends Map {
  terrainConfiguration = SettingsProvider.getTerrain();
  terrainExaggeration = this.terrainConfiguration.exaggeration;
  isVkfGlobeModeEnabledFlag = false;
  abortController = new AbortController();
  minZoomLevelForTerrain = 12;
  minZoomLevelForPitchAnimation = 4;

  enableVkfGlobeMode({ initialZoom } = { initialZoom: null }) {
    this.isVkfGlobeModeEnabledFlag = true;
    this.fire(VKF_GLOBE_MODE_CHANGE_EVENT);
    this.on("zoomend", this._handleZoomBasedTerrainEnabling);
    this.on("zoomend", this._handleZoomBasedPitch);

    const enableWithAnimation = () => {
      flyToAsync(this, this._getFlyToOptions(60))
        .then(() => sleepAsync(500))
        .then(() => {
          this._growTerrain(this.terrainExaggeration);
        });
    };

    const zoomLevel = initialZoom || this.getZoom();

    if (zoomLevel > this.minZoomLevelForPitchAnimation) {
      if (zoomLevel >= this.minZoomLevelForTerrain) {
        this._enableTerrain(enableWithAnimation);
        this.setProjection({ type: "mercator" });
        return;
      }
      this.setProjection({ type: "globe" });
      this.flyTo(this._getFlyToOptions(60));
    } else {
      this.setMaxPitch(0);
      this.setProjection({ type: "globe" });
    }
  }

  disableVkfGlobeMode() {
    this.isVkfGlobeModeEnabledFlag = false;
    this.setMaxPitch(DEFAULT_MAX_PITCH);
    this.fire(VKF_GLOBE_MODE_CHANGE_EVENT);

    this.off("zoomend", this._handleZoomBasedTerrainEnabling);
    this.off("zoomend", this._handleZoomBasedPitch);

    const flyTo = () => {
      flyToAsync(this, this._getFlyToOptions(0));
    };

    if (this.terrain) {
      this._disableTerrain(flyTo);
      this.setProjection({ type: "mercator" });
      return;
    }

    this.flyTo(this._getFlyToOptions(0));
    this.setProjection({ type: "mercator" });
  }

  /**
   * Know if Vkf globe mode  is enabled or not
   * @returns
   */
  isVkfGlobeModeEnabled() {
    return this.isVkfGlobeModeEnabledFlag;
  }

  _growTerrain(exaggeration, durationMs = 1000) {
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
          currentExaggeration + exaggerationFactor * deltaExaggeration;
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

  _maybeDispatchGrowTerrain(callback) {
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

      callback();
    };

    const source = this.getSource(TERRAIN_SOURCE_ID);
    if (source.loaded()) {
      callback();
    } else {
      this.on("data", dataEventTerrainGrow);
    }
  }

  _addTerrainSource() {
    // Mapping it to the "data" event so that we can check that the terrain
    // growing starts only when terrain tiles are loaded (to reduce glitching)
    this.addSource(TERRAIN_SOURCE_ID, {
      attribution: this.terrainConfiguration.attribution,
      type: "raster-dem",
      tiles: [this.terrainConfiguration.url],
      tileSize: 256,
      minzoom: this.terrainConfiguration.minZoom,
      maxzoom: this.terrainConfiguration.maxZoom,
      encoding: "terrarium",
    });

    // Setting up the terrain with a 0 exaggeration factor
    // so it loads ~seamlessly and then can grow from there
    this.setTerrain({
      source: TERRAIN_SOURCE_ID,
      exaggeration: 0,
    });
  }

  /**
   * Enables the 3D terrain visualization
   */
  _enableTerrain(callback) {
    const exaggeration = this.terrainExaggeration;

    if (exaggeration < 0) {
      console.warn("Terrain exaggeration cannot be negative.");
      return;
    }

    // The terrain has already been loaded,
    // we just update the exaggeration.
    if (this.getTerrain()) {
      this._growTerrain(exaggeration);
      return;
    }

    if (this.loaded() || this.isVkfGlobeModeEnabled()) {
      this._addTerrainSource();
      this._maybeDispatchGrowTerrain(callback);
    } else {
      this.once("load", () => {
        if (this.getTerrain() && this.getSource(TERRAIN_SOURCE_ID)) {
          return;
        }
        this._addTerrainSource();
        this._maybeDispatchGrowTerrain(callback);
      });
    }
  }

  /**
   * Disable the 3D terrain visualization
   */
  _disableTerrain(callback = () => {}) {
    // It could be disabled already
    if (!this.terrain) {
      return;
    }

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
        const newExaggeration = currentExaggeration * exaggerationFactor;
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

        callback();
      }

      this.triggerRepaint();
    };

    this.terrainGrowing = false;
    this.terrainFlattening = true;
    requestAnimationFrame(updateExaggeration);
  }

  _getFlyToOptions(pitch) {
    this.abortController.abort();
    this.abortController = new AbortController();
    return { signal: this.abortController.signal, pitch, duration: 700 };
  }

  _handleZoomBasedTerrainEnabling() {
    const zoomLevel = this.getZoom();
    if (zoomLevel >= this.minZoomLevelForTerrain) {
      this._enableTerrain(() => {
        this._growTerrain(this.terrainExaggeration);
        this.setProjection({ type: "mercator" });
      });

      return;
    }

    this._disableTerrain(() => {
      this.setProjection({ type: "globe" });
    });
  }

  _handleZoomBasedPitch() {
    const zoomLevel = this.getZoom();
    const pitch = this.getPitch();

    if (zoomLevel >= this.minZoomLevelForPitchAnimation) {
      this.setMaxPitch(DEFAULT_MAX_PITCH);
      return;
    }

    if (pitch === 0) {
      this.setMaxPitch(0);
      return;
    }

    this.flyTo(this._getFlyToOptions(0));
    this.once("pitchend", () => {
      this.setMaxPitch(0);
    });
  }
}
