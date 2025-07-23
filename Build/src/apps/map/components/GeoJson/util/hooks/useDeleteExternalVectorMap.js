/*
 * Created by tom.schulze@pikobytes.de on 09.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import {
    layerExternalVectorMapState,
    mapState,
    selectedGeoJsonLayerIdState,
    selectedGeoJsonLayerState,
    selectedLayersState,
} from "@map/atoms";
import { useRecoilCallback } from "recoil";
import { deleteExternalVectorMap } from "../apiExternalVectorMaps";
import { isDefined } from "@util/util";
import { METADATA } from "@map/components/CustomLayers";
import { handleErrorResponseExternalVectorMap } from "../util";
import useNotification from "./useNotification";

const useDeleteExternalVectorMap = () => {
    const { notifyError } = useNotification();

    const deleteExistingExternalVectorMap = useRecoilCallback(
        ({ snapshot, set }) =>
            async () => {
                const map = await snapshot.getPromise(mapState);
                const temporaryLayer = await snapshot.getPromise(
                    layerExternalVectorMapState
                );
                const { selectedLayer } = await snapshot.getPromise(
                    selectedGeoJsonLayerState
                );

                if (
                    !isDefined(map) ||
                    !isDefined(temporaryLayer) ||
                    !isDefined(selectedLayer)
                ) {
                    console.error(
                        "Undefined state. Cannot delete vector map from database"
                    );
                    return;
                }

                const id = temporaryLayer.getMetadata()[METADATA.vectorMapId];

                try {
                    await deleteExternalVectorMap(id);

                    // remove selected layer from map
                    selectedLayer.removeMapLibreLayers(map);

                    // remove layer from layer management
                    set(selectedLayersState, (oldLayers) =>
                        oldLayers.filter((layer) => layer.getId() !== id)
                    );

                    // close selected layers panel
                    set(selectedGeoJsonLayerIdState, null);
                } catch (error) {
                    handleErrorResponseExternalVectorMap(error, notifyError);
                }
            },
        []
    );

    return deleteExistingExternalVectorMap;
};

export default useDeleteExternalVectorMap;
