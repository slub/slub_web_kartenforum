/*
 * Created by tom.schulze@pikobytes.de on 02.12.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import {
    vectorMapDrawState,
    selectedGeoJsonLayerState,
    selectedGeoJsonLayerIdState,
    selectedLayersState,
    selectedGeoJsonFeatureIdentifierState,
} from "@map/atoms";
import { useRecoilCallback } from "recoil";
import { isDefined } from "@util/util";
import { METADATA } from "@map/components/CustomLayers";

import { VECTOR_MAP_TYPES } from "../../constants";
import { deleteVectorMap } from "../apiVectorMaps";
import { exitDrawMode } from "../util";

const useDeleteGeojson = () => {
    const deleteRemoteVectorMap = useRecoilCallback(
        ({ snapshot, set }) =>
            async () => {
                const { selectedLayer } = await snapshot.getPromise(
                    selectedGeoJsonLayerState
                );
                const vectorMapId = selectedLayer.getMetadata(
                    METADATA.vectorMapId
                );
                const layerId = selectedLayer.getId();

                await deleteVectorMap(vectorMapId);

                // in case the feature panel was open before switching to draw mode
                set(selectedGeoJsonFeatureIdentifierState, null);
                set(selectedGeoJsonLayerIdState, null);
                set(selectedLayersState, (oldState) =>
                    oldState.filter((layer) => layer.getId() !== layerId)
                );

                exitDrawMode(set);
            }
    );

    // not needed as the delete button is hidden (discarding the vector map does the same thing)
    // i leave it anyhow just in case the hook gets called when the state variables are set
    const deleteUnsavedRemoteVectorMap = useRecoilCallback(
        ({ set }) =>
            async () => {
                exitDrawMode(set);
            }
    );

    const deleteLocalVectorMap = useRecoilCallback(
        ({ snapshot, set }) =>
            async () => {
                const { selectedLayer } = await snapshot.getPromise(
                    selectedGeoJsonLayerState
                );

                const layerId = selectedLayer.getId();

                // in case the feature panel was open before switching to draw mode
                set(selectedGeoJsonFeatureIdentifierState, null);
                set(selectedGeoJsonLayerIdState, null);
                set(selectedLayersState, (oldState) =>
                    oldState.filter((layer) => layer.getId() !== layerId)
                );

                exitDrawMode(set);
            }
    );

    return useRecoilCallback(({ snapshot }) => async () => {
        const vectorMapDraw = await snapshot.getPromise(vectorMapDrawState);

        if (!isDefined(vectorMapDraw)) {
            return;
        }

        const { type, id } = vectorMapDraw;

        if (type === VECTOR_MAP_TYPES.REMOTE) {
            if (isDefined(id)) {
                await deleteRemoteVectorMap();
            } else {
                await deleteUnsavedRemoteVectorMap();
            }
        } else {
            await deleteLocalVectorMap();
        }
    });
};

export default useDeleteGeojson;
