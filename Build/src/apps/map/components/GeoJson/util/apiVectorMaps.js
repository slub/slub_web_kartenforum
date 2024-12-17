/**
 * Created by nicolas.looschen@pikobytes.de on 28.11.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import settingsProvider from "@settings-provider";

export const createNewVectorMap = async (geojson, metadata) => {
    const georeferenceApi = settingsProvider.getGeoreferenceApiClient();

    const url = "/vector_maps/";

    const result = await georeferenceApi.post(url, { geojson, ...metadata });

    return result.data.id;
};

export const updateVectorMap = async (id, geojson, metadata, version) => {
    const georeferenceApi = settingsProvider.getGeoreferenceApiClient();

    const url = `/vector_maps/${id}`;

    const result = await georeferenceApi.patch(url, {
        geojson,
        metadata,
        current_version: version,
    });

    return result.data.version;
};

export const getVectorMap = async (id) => {
    const georeferenceApi = settingsProvider.getGeoreferenceApiClient();

    const url = `/vector_maps/${id}`;

    const result = await georeferenceApi.get(url);

    return result.data;
};

export const deleteVectorMap = async (id) => {
    const georeferenceApi = settingsProvider.getGeoreferenceApiClient();
    const url = `/vector_maps/${id}`;

    const result = await georeferenceApi.delete(url);

    return result.data;
};

export const getVectorMapVersions = async (id) => {
    const georeferenceApi = settingsProvider.getGeoreferenceApiClient();
    const url = `/vector_maps/${id}/versions`;

    const result = await georeferenceApi.get(url);

    return result.data;
};

export const getVectorMapVersion = async (id, version) => {
    const georeferenceApi = settingsProvider.getGeoreferenceApiClient();
    const url = `/vector_maps/${id}/versions/${version}`;

    const result = await georeferenceApi.get(url);

    return result.data;
};

export const getVectorMapRoles = async (id) => {
    const georeferenceApi = settingsProvider.getGeoreferenceApiClient();
    const url = `/vector_maps/${id}/roles`;

    const result = await georeferenceApi.get(url);

    return result.data;
};

/**
 * @param {string} id
 * @param {{create_or_update: {user_name: string, role: "editor|owner"}[], remove:{user_name: string, role: "editor|owner"}}} roles
 * @returns
 */
export const updateVectorMapRoles = async (id, roles) => {
    const georeferenceApi = settingsProvider.getGeoreferenceApiClient();
    const url = `/vector_maps/${id}/roles`;

    const result = await georeferenceApi.patch(url, { ...roles });
    return result.data;
};
