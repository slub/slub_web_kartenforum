/*
 * Created by tom.schulze@pikobytes.de on 09.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import {
    layerExternalVectorMapState,
    mapState,
    selectedGeoJsonLayerLastUpdatedState,
    selectedGeoJsonLayerState,
    selectedLayersState,
} from "@map/atoms";
import { useRecoilCallback } from "recoil";
import {
    metadataLayerToExternal,
    metadataExternalToApi,
} from "../../GeoJsonMetadataPanel/external/util";
import {
    createExternalVectorMap,
    updateExternalVectorMap,
} from "../apiExternalVectorMaps";
import { GeoJsonLayer, METADATA } from "@map/components/CustomLayers";
import { isDefined } from "@util/util";
import { useVectorMapExternalModeInitializers } from "../../ExternalVectorMapLoader/ExternalVectorMapLoader";
import { isNewExternalVectorMap } from "./useHorizontalExternalVectorMapMode";
import {
    handleErrorResponseExternalVectorMap,
    updateExternalVectorMapLayerMetadata,
} from "../util";
import equal from "fast-deep-equal";
import useNotification from "./useNotification";

const useSaveExternalVectorMap = () => {
    const { notifyError } = useNotification();
    const { exitExternalVectorLayerMode } =
        useVectorMapExternalModeInitializers();

    const createNewExternalVectorMap = useRecoilCallback(
        ({ set, snapshot }) =>
            async () => {
                const tempLayer = await snapshot.getPromise(
                    layerExternalVectorMapState
                );
                const map = await snapshot.getPromise(mapState);

                if (!isDefined(tempLayer) || !isDefined(map)) {
                    console.error(
                        "State error. Cannot save external vector map to database."
                    );
                    return;
                }

                const metadata = metadataExternalToApi(tempLayer.getMetadata());
                const geoJson = tempLayer.getGeoJson();

                try {
                    const id = await createExternalVectorMap(metadata);

                    const newLayer = GeoJsonLayer.fromApplication({
                        metadata: {
                            ...tempLayer.getMetadata(),
                            [METADATA.id]: id,
                            [METADATA.vectorMapId]: id,
                        },
                        geoJson,
                    });

                    newLayer.addLayerToMap(map);
                    set(selectedLayersState, (oldLayers) => [
                        ...oldLayers,
                        newLayer,
                    ]);
                } catch (error) {
                    handleErrorResponseExternalVectorMap(error, notifyError);
                    return;
                }

                exitExternalVectorLayerMode();
            },
        []
    );

    const updateExistingExternalVectorMap = useRecoilCallback(
        ({ snapshot, set }) =>
            async () => {
                const tempLayer = await snapshot.getPromise(
                    layerExternalVectorMapState
                );
                const map = await snapshot.getPromise(mapState);

                const { selectedLayer } = await snapshot.getPromise(
                    selectedGeoJsonLayerState
                );

                if (
                    !isDefined(tempLayer) ||
                    !isDefined(map) ||
                    !isDefined(selectedLayer)
                ) {
                    console.error(
                        "State error. Cannot save external vector map to database."
                    );
                    return;
                }

                const geoJson = tempLayer.getGeoJson();
                const id = tempLayer.getMetadata()[METADATA.vectorMapId];

                const intialMetadata = metadataLayerToExternal(
                    selectedLayer.getMetadata()
                );
                const metadata = metadataLayerToExternal(
                    tempLayer.getMetadata()
                );
                const hasMetadataChanged = !equal(intialMetadata, metadata);

                try {
                    if (hasMetadataChanged) {
                        await updateExternalVectorMap(
                            id,
                            metadataExternalToApi(metadata)
                        );

                        updateExternalVectorMapLayerMetadata(
                            selectedLayer,
                            metadata
                        );

                        if (
                            intialMetadata[METADATA.externalContentType] !==
                            metadata[METADATA.externalContentType]
                        ) {
                            // reinitialize layer
                            selectedLayer.removeMapLibreLayers(map);
                            const newLayer = GeoJsonLayer.fromApplication({
                                geoJson,
                                metadata: selectedLayer.getMetadata(),
                            });
                            newLayer.addLayerToMap(map);

                            set(selectedLayersState, (oldLayers) => {
                                const idx = oldLayers.findIndex(
                                    (layer) =>
                                        layer.getId() === selectedLayer.getId()
                                );
                                oldLayers[idx] = newLayer;
                                return [...oldLayers];
                            });
                        } else {
                            selectedLayer.setDataOnMap(map, geoJson);
                            set(
                                selectedGeoJsonLayerLastUpdatedState,
                                Date.now()
                            );
                        }
                    }
                } catch (error) {
                    handleErrorResponseExternalVectorMap(error, notifyError);
                    return;
                }
                exitExternalVectorLayerMode();
            },
        []
    );

    return useRecoilCallback(
        ({ snapshot }) =>
            async () => {
                const layer = await snapshot.getPromise(
                    layerExternalVectorMapState
                );

                if (!isDefined(layer)) {
                    return;
                }

                if (isNewExternalVectorMap(layer.getId())) {
                    return await createNewExternalVectorMap();
                }

                return await updateExistingExternalVectorMap();
            },
        []
    );
};

export default useSaveExternalVectorMap;
