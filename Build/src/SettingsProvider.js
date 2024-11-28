/**
 * Created by nicolas.looschen@pikobytes.de on 16.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import axios from "axios";
import { isDefined, isString } from "@util/util";

export const LANGUAGE_CODE = {
    EN: "en",
    DE: "de",
};

const hasDebugCredentials =
    typeof process !== "undefined" &&
    isDefined(process.env.DEV_MODE_SECRET) &&
    process.env.DEV_MODE_SECRET !== "" &&
    isDefined(process.env.DEV_MODE_NAME) &&
    process.env.DEV_MODE_NAME !== "";

const debugCredentials = () => ({
    "Dev-Mode-Secret": process.env.DEV_MODE_SECRET,
    "Dev-Mode-Name": process.env.DEV_MODE_NAME,
});

let settingsObject = {
    BASEMAPS: [
        {
            id: "slub-osm",
            label: "SLUB OSM",
            urls: [
                "https://tile-2.kartenforum.slub-dresden.de/styles/maptiler-basic-v2/style.json",
            ],
            type: "vector",
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
    LANGUAGE_CODE: LANGUAGE_CODE.EN,
    MARKER_IMAGE_ID: "marker",
    USERNAME: "anonymous",
    USER_ISAUTHENTICATED: false,
};

export default {
    axiosApiInstance: null,

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
        return [
            "https://tile-1.kartenforum.slub-dresden.de/styles/maptiler-basic-v2/{z}/{x}/{y}.png",
            "https://tile-2.kartenforum.slub-dresden.de/styles/maptiler-basic-v2/{z}/{x}/{y}.png",
        ];
    },

    /**
     * Returns the default map view. Center should always be in EPSG:4326.
     * @returns {{
     *     center: [number, number],
     *     zoom: number,
     *     maxZoom: number,
     *     minZoom: number,
     * }}
     */
    getDefaultMapView() {
        return Object.assign(
            {
                center: [14.9928, 51.1463],
                zoom: 6.3,
                maxZoom: 19,
                minZoom: 0,
            },
            settingsObject["MAPVIEW_PARAMS"]
        );
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

    /**
     * Returns the terrain configuration
     * @returns {{
     *     url: string,
     *     attribution: string,
     *     exaggeration: number,
     *     minZoom: number,
     *     maxZoom: number,
     * }}
     */
    getTerrain() {
        return Object.assign(
            {
                url: "https://terrain.kartenforum.slub-dresden.de/v2/{z}/{x}/{y}.png",
                attribution:
                    "<a href='https://kartenforum.slub-dresden.de/attribution' target='_blank'>© U.S. Geological Survey and others</a>",
                exaggeration: 1,
                minZoom: 0,
                maxZoom: 12,
            },
            settingsObject["TERRAIN_TILES"]
        );
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

    _initAxiosApiInstance() {
        const baseURL = settingsObject["API_GEOREFERENCE_BASEURL"];

        const isEmptyBaseURL = isString(baseURL) && baseURL.length === 0;
        if (!isDefined(baseURL) || isEmptyBaseURL) {
            throw new Error("The URL for the georeference service is not set.");
        }

        //
        // Build axios instance configuration
        //

        // Debug credentials have the form of { "Dev-Mode-Secret": "some_secret", "Dev-Mode-Name": "some_name" }. They
        // can only be used if the server is started with the proper credentials.

        const config = Object.assign(
            {
                baseURL,
                withCredentials: true,
            },
            hasDebugCredentials
                ? {
                      headers: {
                          get: debugCredentials(),
                          post: debugCredentials(),
                          put: debugCredentials(),
                          delete: debugCredentials(),
                      },
                  }
                : {}
        );

        this.axiosApiInstance = axios.create(config);
    },

    getGeoreferenceApiClient() {
        if (isDefined(this.axiosApiInstance)) {
            return this.axiosApiInstance;
        }

        this._initAxiosApiInstance();
        return this.axiosApiInstance;
    },

    getMarkerSettings() {
        const url = settingsObject["MARKER_URL"];

        if (!isDefined(url)) {
            throw new Error("The marker icon url is not set.");
        }

        const id = settingsObject["MARKER_IMAGE_ID"];

        return { id, url };
    },
};
