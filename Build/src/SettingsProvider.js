/**
 * Created by nicolas.looschen@pikobytes.de on 16.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import axios from "axios";
import { isDefined, isString } from "./util/util";

let settingsObject = {
    BASEMAPS: [
        {
            id: "slub-osm",
            label: "SLUB OSM",
            urls: [
                "https://basemaps-1.pikobytes.de/styles/maptiler-basic-v2/{z}/{x}/{y}@2x.png",
                "https://basemaps-2.pikobytes.de/styles/maptiler-basic-v2/{z}/{x}/{y}@2x.png",
                "https://basemaps-3.pikobytes.de/styles/maptiler-basic-v2/{z}/{x}/{y}@2x.png",
            ],
            type: "xyz",
            tileSize: 512,
        },
        {
            id: "bkg-topoplus",
            label: "BKG TopPlusOpen",
            urls: ["https://sgx.geodatenzentrum.de/wms_topplus_open"],
            type: "wms",
            layers: "web",
            tileSize: 512,
        },
    ],
    ENABLE_TILE_PRELOADING: false,
    LANGUAGE_CODE: "en",
    USERNAME: "anonymous",
    USER_ISAUTHENTICATED: false,
};

export default {
    axiosGeoRefApiInstance: null,

    appendSettings(newSettings) {
        settingsObject = Object.assign({}, settingsObject, newSettings);
    },
    getSettings() {
        return settingsObject;
    },

    /**
     * Returns an array of basemap configurations
     * returns {{
     *     id: string,
     *     label: string,
     *     urls: string[],
     *     type: "xyz" | "wms",
     *     layers: string | undefined,
     *     tileSize: 512,
     * }}
     */
    getBaseMaps() {
        return settingsObject.BASEMAPS;
    },

    /**
     * Returns the default base maps urls
     * @returns {string[]}
     */
    getDefaultBaseMapUrls() {
        return settingsObject.BASEMAPS[0].urls;
    },

    /**
     * Returns the default map view
     * @returns {{
     *     projection: string,
     *     extent: [number, number, number, number],
     *     center: [number, number],
     *     zoom: number,
     *     maxZoom: number,
     *     minZoom: number,
     * }}
     */
    getDefaultMapView() {
        return Object.assign(
            {
                projection: "EPSG:3857",
                extent: [-20026376.39, -20048966.1, 20026375.39, 20048966.1],
                center: [1528150, 6630500],
                zoom: 2,
                maxZoom: 19,
                minZoom: 0,
            },
            settingsObject["MAPVIEW_PARAMS"]
        );
    },

    /**
     * Returns the 3d preloading state from the settings object
     * @return {*}
     */
    getIsTilePreloadingEnabled() {
        return settingsObject.ENABLE_TILE_PRELOADING === 1;
    },

    /**
     * Returns the language dictionary.
     * @returns {Object}
     */
    getLanguageDict() {
        return settingsObject.dictionary;
    },

    /**
     * Returns the minimum zoom level to which to out zoom within 3d view.
     * @returns {number}
     */
    getMin3DZoomLevel() {
        return 9;
    },

    /**
     * Returns url to the nominamtim placename service
     * @returns {string}
     */
    getNominatimUrl() {
        return settingsObject["NOMINATIM_URL"];
    },

    getTerrainAttribution() {
        return settingsObject["TERRAIN_TILES"].attribution;
    },

    /**
     * Returns the description of a terrain tile services
     * @returns {{
     *     asset: number,
     *     token: string,
     *     type: "cesium" | "maptiler",
     *     url: string | number
     * }}
     */
    getTerrainService() {
        return {
            asset: settingsObject["TERRAIN_TILES"].asset,
            token: settingsObject["TERRAIN_TILES"].token,
            type:
                settingsObject["TERRAIN_TILES"].type !== undefined
                    ? settingsObject["TERRAIN_TILES"].type.toLowerCase()
                    : "maptiler",
            url: settingsObject["TERRAIN_TILES"].url,
        };
    },

    /**
     * Returns the current username.
     * @returns {string|undefined}
     */
    getUsername() {
        return settingsObject["USERNAME"];
    },

    isUserAuthenticated() {
        return settingsObject["USER_ISAUTHENTICATED"] === true;
    },

    updateSettings(newSettings) {
        settingsObject = newSettings;
    },

    initAxiosGeoRefApiInstance() {
        const baseURL = settingsObject["API_GEOREFERENCE_BASEURL"];

        const isEmptyBaseURL = isString(baseURL) && baseURL.length === 0;
        if (!isDefined(baseURL) || isEmptyBaseURL) {
            throw new Error("The URL for the georeference service is not set.");
        }

        this.axiosGeoRefApiInstance = axios.create({
            baseURL,
            withCredentials: true,
        });
    },

    getGeoreferenceApiClient() {
        if (isDefined(this.axiosGeoRefApiInstance)) {
            return this.axiosGeoRefApiInstance;
        }

        this.initAxiosGeoRefApiInstance();
        return this.axiosGeoRefApiInstance;
    },
};
