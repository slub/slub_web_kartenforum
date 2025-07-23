/*
 * Created by tom.schulze@pikobytes.de on 09.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import {
    layerExternalVectorMapState,
    forceUpdateLayerExternalVectorMapState,
    mapState,
} from "@map/atoms";
import { GeoJsonLayer, METADATA } from "@map/components/CustomLayers";
import { isDefined } from "@util/util";
import { useRecoilCallback } from "recoil";
import { updateExternalVectorMapLayerMetadata } from "../util";
import useZoomLayerToExtent from "@map/components/LayerManagement/LayerManagementEntry/components/ZoomToExtentButton/useZoomLayerToExtent";

// update the temporary external vector map layer on map, when form data has been changed
const useUpdateExternalVectorMapLayer = () => {
    const { zoomToExtent } = useZoomLayerToExtent();

    const updateExternalVectorMapLayer = useRecoilCallback(
        ({ snapshot, set }) =>
            async ({ metadata, geoJson }) => {
                const map = await snapshot.getPromise(mapState);
                const layer = await snapshot.getPromise(
                    layerExternalVectorMapState
                );

                if (!isDefined(map) || !isDefined(layer)) {
                    return;
                }

                const oldContentType = layer.getMetadata(
                    METADATA.externalContentType
                );

                // only update geojson on layer if externalContentUrl has changed
                if (isDefined(geoJson)) {
                    const applicationGeoJson =
                        GeoJsonLayer.toApplicationState(geoJson);

                    layer.setDataOnMap(map, applicationGeoJson);
                    zoomToExtent(layer);
                }

                updateExternalVectorMapLayerMetadata(layer, metadata);

                if (metadata[METADATA.externalContentType] !== oldContentType) {
                    //re-initialize layer
                    layer.removeMapLibreLayers(map);
                    const newLayer = GeoJsonLayer.fromApplication({
                        geoJson: layer.getGeoJson(),
                        metadata: layer.getMetadata(),
                    });
                    newLayer.addLayerToMap(map);
                    set(layerExternalVectorMapState, newLayer);
                } else {
                    set(
                        forceUpdateLayerExternalVectorMapState,
                        (old) => old + 1
                    );
                }
            },
        []
    );

    return { updateExternalVectorMapLayer };
};

export default useUpdateExternalVectorMapLayer;
