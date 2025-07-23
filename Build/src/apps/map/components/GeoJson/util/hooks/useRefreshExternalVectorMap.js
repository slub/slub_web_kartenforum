/*
 * Created by tom.schulze@pikobytes.de on 13.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { layerExternalVectorMapState } from "@map/atoms";
import { METADATA } from "@map/components/CustomLayers";
import { useRecoilCallback } from "recoil";
import { refreshSearchIndex } from "../apiExternalVectorMaps";
import { handleErrorResponseExternalVectorMap } from "../util";
import useNotification from "./useNotification";

const useRefreshExternalVectorMap = () => {
    const { notifySuccess, notifyError } = useNotification();

    return useRecoilCallback(
        ({ snapshot }) =>
            async () => {
                const temporaryLayer = await snapshot.getPromise(
                    layerExternalVectorMapState
                );
                const id = temporaryLayer.getMetadata()[METADATA.vectorMapId];
                try {
                    await refreshSearchIndex(id);
                    notifySuccess("geojson-metadata-panel-notify-refresh");
                } catch (error) {
                    handleErrorResponseExternalVectorMap(error, notifyError);
                }
            },
        []
    );
};

export default useRefreshExternalVectorMap;
