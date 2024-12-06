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

export const useSaveGeoJson = () => {
    const createRemoteVectorMap = useRecoilCallback(
        ({ snapshot, set }) =>
            async () => {
                const draw = await snapshot.getPromise(drawState);
                if (draw) {
                    const geojson = draw.getAll();
                    const map = await snapshot.getPromise(mapState);

                    const metadata = await snapshot.getPromise(
                        metadataDrawState
                    );

                    // persist vector map to remote
                    const id = await createNewVectorMap(geojson, metadata);

                    // create geojson application layer

                    const geojsonLayer = new GeoJsonLayer({
                        metadata: {
                            ...metadata,
                            [METADATA.id]: id,
                            [METADATA.vectorMapId]: id,
                            [METADATA.version]: 0,
                        },
                        geoJSON: geojson,
                    });

                    geojsonLayer.addLayerToMap(map);

                    set(selectedLayersState, (oldSelectedLayers) =>
                        oldSelectedLayers.concat(geojsonLayer)
                    );
                    set(selectedGeoJsonLayerIdState, geojsonLayer.getId());

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
                    // @TODO: Improve error handling
                    const geoJson = draw.getAll();

                    try {
                        const newVersion = await updateVectorMap(
                            vectorMapDraw.id,
                            geoJson,
                            metadata,
                            vectorMapDraw.version
                        );

                        // update the application layer
                        if (isDefined(map) && isDefined(selectedLayer)) {
                            // update application layer geojson
                            selectedLayer.setDataOnMap(map, geoJson);
                            // update application layer version
                            selectedLayer.updateMetadata(
                                METADATA.version,
                                newVersion
                            );

                            // update application layer metadata
                            Object.keys(metadata).forEach((key) => {
                                selectedLayer.updateMetadata(
                                    key,
                                    metadata[key]
                                );
                            });

                            // reset draw state
                            exitDrawMode(set);
                        }
                    } catch (e) {
                        if (e.response) {
                            if (e.response.status === 409) {
                                set(notificationState, {
                                    id: "mapWrapper",
                                    type: "danger",
                                    text: translate(
                                        "geojson-draw-version-conflict"
                                    ),
                                });
                            }
                        } else {
                            console.error(e);
                        }
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
