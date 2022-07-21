/**
 * Created by nicolas.looschen@pikobytes.de on 30.06.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import SettingsProvider from "../SettingsProvider.js";
import axios from "axios";
import { readMosaicMap, serializeMosaicMap } from "./parser.js";
import { VALUE_CREATE_NEW_MAP } from "../apps/mosaic_map/components/MosaicMapSelectorDropdown/MosaicMapSelectorDropdown.jsx";

const validatebaseUrl = (baseUrl) => {
    if (baseUrl === undefined) {
        throw new Error("The url for the map_mposaic endpoint is not set.");
    }
};

const getMosaicMapIdSearchParam = (mosaicMapId) => {
    const urlParams = new URLSearchParams({ mosaic_map_id: mosaicMapId });
    return urlParams.toString();
};

export const deleteMosaicMap = async (mosaicMapId) => {
    const baseUrl =
        SettingsProvider.getSettings().API_GEOREFERENCE_DELETE_MOSAIC_MAP;

    const response = await axios.get(
        `${baseUrl}&${getMosaicMapIdSearchParam(mosaicMapId)}`
    );

    if (response.status === 200) {
        return response.data;
    } else {
        console.error(
            "Something went wrong while trying to delete the mosaic map."
        );
        throw new Error(
            "Something went wrong while trying to delete the mosaic map."
        );
    }
};

export const getMosaicMaps = async () => {
    const baseUrl =
        SettingsProvider.getSettings().API_GEOREFERENCE_GET_MOSAIC_MAPS;

    validatebaseUrl(baseUrl);

    // Build url and query it
    const response = await axios.get(`${baseUrl}`);

    if (response.status === 200) {
        return response.data.map(readMosaicMap);
    } else {
        console.error(
            "Something went wrong while trying to fetch the mosaic maps."
        );
        throw new Error(
            "Something went wrong while trying to fetch the mosaic maps."
        );
    }
};

export const postRefreshMosaicMaps = async (mosaicMapId) => {
    const baseUrl =
        SettingsProvider.getSettings()
            .API_GEOREFERENCE_REFRESH_MOSAIC_MAP_SERVICE;

    validatebaseUrl(baseUrl);

    // Build url and query it
    const response = await axios.post(
        `${baseUrl}&${getMosaicMapIdSearchParam(mosaicMapId)}`
    );

    if (response.status === 200) {
        return response.data;
    } else {
        console.error(
            "Something went wrong while trying to refresh the mosaic maps overview."
        );
        throw new Error(
            "Something went wrong while trying to refresh the mosaic maps overview."
        );
    }
};

export const postMosaicMap = async (mosaicMap) => {
    if (mosaicMap.id === undefined || mosaicMap.id === VALUE_CREATE_NEW_MAP) {
        const { id, ...rest } = mosaicMap;
        return await postCreateMosaicMap(rest);
    } else {
        return await postUpdateMosaicMap(mosaicMap);
    }
};

export const postCreateMosaicMap = async (mosaicMap) => {
    const baseUrl =
        SettingsProvider.getSettings().API_GEOREFERENCE_CREATE_MOSAIC_MAP;

    validatebaseUrl(baseUrl);

    const response = await axios.post(baseUrl, serializeMosaicMap(mosaicMap));

    if (response.status === 200) {
        return readMosaicMap(response.data);
    } else {
        console.error(
            "Something went wrong while trying to create the mosaic map."
        );
        throw new Error(
            "Something went wrong while trying to create the mosaic map."
        );
    }
};

export const postUpdateMosaicMap = async (mosaicMap) => {
    const baseUrl =
        SettingsProvider.getSettings().API_GEOREFERENCE_UPDATE_MOSAIC_MAP;

    validatebaseUrl(baseUrl);

    const response = await axios.post(
        `${baseUrl}&${getMosaicMapIdSearchParam(mosaicMap.id)}`,
        serializeMosaicMap(mosaicMap)
    );

    if (response.status === 200) {
        return readMosaicMap(response.data);
    } else {
        console.error(
            "Something went wrong while trying to update the mosaic map."
        );
        throw new Error(
            "Something went wrong while trying to update the mosaic map."
        );
    }
};
