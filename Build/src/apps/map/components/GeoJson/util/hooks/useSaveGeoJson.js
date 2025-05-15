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
    initialGeoJsonDrawState,
    isActiveVectorMapVersionDifferentState,
} from "@map/atoms";
import { VECTOR_MAP_TYPES } from "@map/components/GeoJson/constants";
import { isDefined } from "@util/util";
import {
    createNewVectorMap,
    updateVectorMap,
} from "@map/components/GeoJson/util/apiVectorMaps";
import { GeoJsonLayer, METADATA } from "@map/components/CustomLayers";
import {
    exitDrawMode,
    processNewGeoJsonForPersistence,
    processUpdatedGeoJsonForPersistence,
    handleErrorResponse,
    metadataAppToMetadataApi,
    metadataLayerToMetadataDraw,
    removeAllFeatureIds,
} from "@map/components/GeoJson/util/util";

import equal from "fast-deep-equal";
import { isVectorMapMetadataEditAllowed } from "../authorization";
import useNotification from "./useNotification";

export const useSaveGeoJson = () => {
    const { notifyError } = useNotification();

    const createRemoteVectorMap = useRecoilCallback(
        ({ snapshot, set }) =>
            async () => {
                const draw = await snapshot.getPromise(drawState);
                if (draw) {
                    const geoJson = processNewGeoJsonForPersistence(
                        draw.getAll()
                    );
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
                        handleErrorResponse(error, notifyError);
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
                    const hasVectorMapVersionChanged =
                        await snapshot.getPromise(
                            isActiveVectorMapVersionDifferentState
                        );

                    const initialGeoJson = await snapshot.getPromise(
                        initialGeoJsonDrawState
                    );

                    const initialMetadata = metadataLayerToMetadataDraw(
                        selectedLayer.getMetadata()
                    );

                    const geoJsonFromDraw = draw.getAll();

                    const hasGeoJsonChanged =
                        !equal(initialGeoJson, geoJsonFromDraw) ||
                        hasVectorMapVersionChanged;
                    // metadata is not versioned
                    const hasMetadataChanged = !equal(
                        initialMetadata,
                        metadata
                    );
                    const canMetadataChange =
                        hasMetadataChanged &&
                        isVectorMapMetadataEditAllowed(vectorMapDraw);

                    // do nothing & clean up draw mode
                    if (!hasGeoJsonChanged && !canMetadataChange) {
                        exitDrawMode(set);
                        return;
                    }

                    const nextVersion = vectorMapDraw.version + 1;
                    const processedGeoJson =
                        processUpdatedGeoJsonForPersistence(
                            initialGeoJson,
                            geoJsonFromDraw,
                            nextVersion
                        );
                    const metadataToSend = metadataAppToMetadataApi(metadata);

                    let newVersion = null;
                    try {
                        // Only push geojson and metdata, if there are changes
                        newVersion = await updateVectorMap(
                            vectorMapDraw.id,
                            hasGeoJsonChanged ? processedGeoJson : null,
                            canMetadataChange ? metadataToSend : null,
                            vectorMapDraw.version
                        );
                    } catch (error) {
                        handleErrorResponse(error, notifyError);
                    }

                    // update the application layer
                    if (
                        isDefined(map) &&
                        isDefined(selectedLayer) &&
                        isDefined(newVersion)
                    ) {
                        // update application layer geojson
                        // update application layer version
                        if (hasGeoJsonChanged) {
                            selectedLayer.setDataOnMap(map, processedGeoJson);
                            selectedLayer.updateMetadata(
                                METADATA.version,
                                newVersion
                            );
                        }

                        // update application layer metadata
                        if (canMetadataChange) {
                            Object.keys(metadata).forEach((key) => {
                                selectedLayer.updateMetadata(
                                    key,
                                    metadata[key]
                                );
                            });
                        }

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

                    // update application layer
                    if (isDefined(map) && isDefined(selectedLayer)) {
                        // reset all feature ids (draw uses non-integers)
                        // ids dont need to be stable for local vector maps
                        const geojson = removeAllFeatureIds(draw.getAll());

                        // implicitly generate new ids
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
