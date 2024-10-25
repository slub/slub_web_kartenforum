/**
 * Created by nicolas.looschen@pikobytes.de on 30.06.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import SettingsProvider from "@settings-provider";
import { readMosaicMap, serializeMosaicMap } from "./parser.js";
import { VALUE_CREATE_NEW_MAP } from "@mosaic-map/components/MosaicMapSelectorDropdown/MosaicMapSelectorDropdown.jsx";

export const deleteMosaicMap = async (mosaicMapId) => {
    const georeferenceApi = SettingsProvider.getGeoreferenceApiClient();

    const path = `/mosaic_maps/${mosaicMapId}`;
    const response = await georeferenceApi.delete(path);

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
    const georeferenceApi = SettingsProvider.getGeoreferenceApiClient();
    const path = "/mosaic_maps/";

    // Build url and query it
    const response = await georeferenceApi.get(path);

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
    const georeferenceApi = SettingsProvider.getGeoreferenceApiClient();

    // Build url and query it
    const path = `/mosaic_maps/${mosaicMapId}/refresh`;
    const response = await georeferenceApi.post(path);

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
        // eslint-disable-next-line no-unused-vars
        const { id, ...rest } = mosaicMap;
        return await postCreateMosaicMap(rest);
    } else {
        return await postUpdateMosaicMap(mosaicMap);
    }
};

export const postCreateMosaicMap = async (mosaicMap) => {
    const georeferenceApi = SettingsProvider.getGeoreferenceApiClient();

    // Build url and query it
    const path = `/mosaic_maps/`;
    const payload = serializeMosaicMap(mosaicMap);
    const response = await georeferenceApi.post(path, payload);

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
    const georeferenceApi = SettingsProvider.getGeoreferenceApiClient();

    // Build url and query it
    const { id: mosaicMapId } = mosaicMap;
    const path = `/mosaic_maps/${mosaicMapId}`;
    const payload = serializeMosaicMap(mosaicMap);

    const response = await georeferenceApi.post(path, payload);

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
