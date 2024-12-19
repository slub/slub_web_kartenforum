/**
 * Created by nicolas.looschen@pikobytes.de on 28.11.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { useRecoilCallback } from "recoil";
import {
    drawState,
    mapState,
    selectedGeoJsonLayerLastUpdatedState,
    selectedGeoJsonLayerIdState,
    selectedGeoJsonLayerState,
    selectedLayersState,
    vectorMapDrawState,
    metadataDrawState,
} from "@map/atoms";
import { VECTOR_MAP_TYPES } from "@map/components/GeoJson/constants";
import { isDefined, translate } from "@util/util";
import {
    createNewVectorMap,
    updateVectorMap,
} from "@map/components/GeoJson/util/apiVectorMaps";
import { GeoJsonLayer, METADATA } from "@map/components/CustomLayers";
import { exitDrawMode } from "@map/components/GeoJson/util/util";
import { notificationState } from "@atoms";

const httpErrorNotification = (translationKey) => ({
    id: "mapWrapper",
    type: "danger",
    text: translate(translationKey),
});

const metadataAppToMetadataApi = (metadata) => {
    const mappedMetadata = structuredClone(metadata);

    const keyMap = {
        [METADATA.thumbnailUrl]: "link_thumb",
    };

    for (const [appKey, apiKey] of Object.entries(keyMap)) {
        const value = mappedMetadata[appKey];
        mappedMetadata[apiKey] = value;
        delete mappedMetadata[appKey];
    }

    return mappedMetadata;
};

export const useSaveGeoJson = () => {
    const createRemoteVectorMap = useRecoilCallback(
        ({ snapshot, set }) =>
            async () => {
                const draw = await snapshot.getPromise(drawState);
                if (draw) {
                    const geoJson = draw.getAll();
                    const map = await snapshot.getPromise(mapState);

                    const metadata = await snapshot.getPromise(
                        metadataDrawState
                    );

                    let id = null;

                    try {
                        // persist vector map to remote
                        id = await createNewVectorMap(
                            geoJson,
                            metadataAppToMetadataApi(metadata)
                        );
                    } catch (error) {
                        if (error.response) {
                            if (error.response.status === 401) {
                                set(
                                    notificationState,
                                    httpErrorNotification(
                                        "common-errors-http-401"
                                    )
                                );
                                return;
                            }

                            if (error.response.status === 403) {
                                set(
                                    notificationState,
                                    httpErrorNotification(
                                        "common-errors-http-403"
                                    )
                                );
                                return;
                            }
                        }
                        set(
                            notificationState,
                            httpErrorNotification("common-errors-unexpected")
                        );
                        console.error(error);
                        return;
                    }

                    if (isDefined(id)) {
                        // create geojson application layer
                        const geojsonLayer = GeoJsonLayer.fromApplication({
                            metadata: {
                                ...metadata,
                                [METADATA.id]: id,
                                [METADATA.vectorMapId]: id,
                                [METADATA.version]: 0,
                                [METADATA.userRole]: "owner",
                            },
                            geoJson,
                        });

                        geojsonLayer.addLayerToMap(map);

                        set(selectedLayersState, (oldSelectedLayers) =>
                            oldSelectedLayers.concat(geojsonLayer)
                        );
                        set(selectedGeoJsonLayerIdState, geojsonLayer.getId());
                    }

                    exitDrawMode(set);
                }
            }
    );

    const updateRemoteVectorMap = useRecoilCallback(
        ({ snapshot, set }) =>
            async () => {
                const draw = await snapshot.getPromise(drawState);
                if (draw) {
                    const { selectedLayer } = await snapshot.getPromise(
                        selectedGeoJsonLayerState
                    );

                    const map = await snapshot.getPromise(mapState);
                    const metadata = await snapshot.getPromise(
                        metadataDrawState
                    );
                    const vectorMapDraw = await snapshot.getPromise(
                        vectorMapDrawState
                    );

                    // @TODO: Only push geojson if there are changes
                    // @TODO: Only push changed metadata properties
                    // @TODO: Update metadata has to be None for non owner/admin user
                    const geoJson = draw.getAll();

                    let newVersion = null;
                    try {
                        newVersion = await updateVectorMap(
                            vectorMapDraw.id,
                            geoJson,
                            metadataAppToMetadataApi(metadata),
                            vectorMapDraw.version
                        );
                    } catch (e) {
                        if (e.response) {
                            if (e.response.status === 401) {
                                set(
                                    notificationState,
                                    httpErrorNotification(
                                        "common-errors-http-401"
                                    )
                                );
                                return;
                            }

                            if (e.response.status === 403) {
                                set(
                                    notificationState,
                                    httpErrorNotification(
                                        "common-errors-http-403"
                                    )
                                );
                                return;
                            }

                            if (e.response.status === 409) {
                                set(
                                    notificationState,
                                    httpErrorNotification(
                                        "geojson-draw-version-conflict"
                                    )
                                );
                                return;
                            }
                        }

                        set(
                            notificationState,
                            httpErrorNotification("common-errors-unexpected")
                        );
                        console.error(e);
                        return;
                    }

                    // update the application layer
                    if (
                        isDefined(newVersion) &&
                        isDefined(map) &&
                        isDefined(selectedLayer)
                    ) {
                        // update application layer geojson
                        selectedLayer.setDataOnMap(map, geoJson);
                        // update application layer version
                        selectedLayer.updateMetadata(
                            METADATA.version,
                            newVersion
                        );

                        // update application layer metadata
                        Object.keys(metadata).forEach((key) => {
                            selectedLayer.updateMetadata(key, metadata[key]);
                        });
                        set(selectedGeoJsonLayerLastUpdatedState, Date.now());

                        // reset draw state
                        exitDrawMode(set);
                    }
                }
            }
    );

    const saveLocalVectorMap = useRecoilCallback(
        ({ snapshot, set }) =>
            async () => {
                const draw = await snapshot.getPromise(drawState);
                if (draw) {
                    const { selectedLayer } = await snapshot.getPromise(
                        selectedGeoJsonLayerState
                    );

                    const map = await snapshot.getPromise(mapState);
                    const metadata = await snapshot.getPromise(
                        metadataDrawState
                    );

                    if (isDefined(map) && isDefined(selectedLayer)) {
                        // update application layer
                        const geojson = draw.getAll();
                        selectedLayer.setDataOnMap(map, geojson);
                        Object.keys(metadata).forEach((key) => {
                            selectedLayer.updateMetadata(key, metadata[key]);
                        });
                        set(selectedGeoJsonLayerLastUpdatedState, Date.now());

                        // reset state
                        exitDrawMode(set);
                    }
                }
            }
    );

    return useRecoilCallback(({ snapshot }) => async () => {
        const vectorMap = await snapshot.getPromise(vectorMapDrawState);

        if (vectorMap === null) return;

        if (vectorMap.type === VECTOR_MAP_TYPES.REMOTE) {
            if (vectorMap.id === null) {
                await createRemoteVectorMap();
            } else {
                await updateRemoteVectorMap();
            }
        } else {
            await saveLocalVectorMap();
        }
    });
};

export default useSaveGeoJson;
