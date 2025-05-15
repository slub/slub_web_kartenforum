/*
 * Created by tom.schulze@pikobytes.de on 07.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import settingsProvider from "@settings-provider";

const PATH = "/vector_maps_external";

const createExternalVectorMap = async (metadata) => {
    const georeferenceApi = settingsProvider.getGeoreferenceApiClient();

    const url = `${PATH}/`;

    const result = await georeferenceApi.post(url, metadata);

    return result.data.id;
};

const getExternalVectorMap = async (id) => {
    const georeferenceApi = settingsProvider.getGeoreferenceApiClient();

    const url = `${PATH}/${id}`;

    const result = await georeferenceApi.get(url);

    return result.data;
};

const updateExternalVectorMap = async (id, metadata) => {
    const georeferenceApi = settingsProvider.getGeoreferenceApiClient();

    const url = `${PATH}/${id}`;

    const result = await georeferenceApi.put(url, metadata);

    return result.data;
};

const deleteExternalVectorMap = async (id) => {
    const georeferenceApi = settingsProvider.getGeoreferenceApiClient();

    const url = `${PATH}/${id}`;

    const result = await georeferenceApi.delete(url);

    return result.data.id;
};

const refreshSearchIndex = async (id) => {
    const georeferenceApi = settingsProvider.getGeoreferenceApiClient();

    const url = `${PATH}/refresh_search_index/${id}`;

    await georeferenceApi.post(url);
};

export {
    createExternalVectorMap,
    getExternalVectorMap,
    updateExternalVectorMap,
    deleteExternalVectorMap,
    refreshSearchIndex,
};
