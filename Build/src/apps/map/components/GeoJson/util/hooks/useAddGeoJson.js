/**
 * Created by nicolas.looschen@pikobytes.de on 26.11.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { useRecoilCallback } from "recoil";
import {
    addGeoJsonDialogState,
    initialGeoJsonDrawState,
    horizontalLayoutModeState,
    mapState,
    selectedGeoJsonLayerIdState,
    selectedLayersState,
    metadataDrawState,
    vectorMapDrawState,
} from "@map/atoms";
import { isDefined, translate } from "@util/util";
import { GeoJsonLayer, METADATA } from "@map/components/CustomLayers";
import { notificationState } from "@atoms";
import { HORIZONTAL_LAYOUT_MODE } from "@map/layouts/util";
import { useCallback } from "react";
import { VECTOR_MAP_TYPES } from "@map/components/GeoJson/constants";
import useZoomLayerToExtent from "@map/components/LayerManagement/LayerManagementEntry/components/ZoomToExtentButton/useZoomLayerToExtent";
import { removeAllFeatureIds } from "../util";

export const useAddGeoJson = () => {
    const { zoomToExtent } = useZoomLayerToExtent();

    // Mount new local geojson layer => Create application layer, add to map and select the layer,
    // but dont open the draw view
    const mountLocalGeoJsonLayer = useRecoilCallback(
        ({ snapshot, set }) =>
            async (title, geoJson) => {
                const map = await snapshot.getPromise(mapState);
                if (isDefined(map)) {
                    try {
                        const metadata = {
                            [METADATA.title]: title,
                            // [METADATA.timeChanged]: refGeoJSON.current.modified,
                        };

                        // delete feature ids, to avoid potential invalid ids e.g., strings
                        const processedGeoJson = removeAllFeatureIds(geoJson);

                        // Create geojson layer and generate new ids on the fly
                        const geoJsonLayer = GeoJsonLayer.fromPersistence({
                            metadata,
                            geoJson: processedGeoJson,
                        });

                        // add layer to map
                        geoJsonLayer.addLayerToMap(map);

                        // zoom to extent
                        zoomToExtent(geoJsonLayer);

                        // select newly created layer (open panel on right hand side)
                        set(selectedLayersState, (oldSelectedLayers) => [
                            ...oldSelectedLayers,
                            geoJsonLayer,
                        ]);

                        set(selectedGeoJsonLayerIdState, geoJsonLayer.getId());
                    } catch (e) {
                        console.log(e);
                        set(notificationState, {
                            id: "mapWrapper",
                            type: "danger",
                            text: translate("mapwrapper-geojson-parse-error"),
                        });
                    }

                    set(addGeoJsonDialogState, false);
                }
            },
        [zoomToExtent]
    );

    // Mount geojson to draw view, without creating an application layer
    const mountNewRemoteGeojsonLayer = useRecoilCallback(
        ({ set }) =>
            async (title, geoJson) => {
                // delete feature ids, to avoid potential invalid ids and let mapbox-draw handle ids
                let convertedGeoJson = removeAllFeatureIds(geoJson);
                convertedGeoJson =
                    GeoJsonLayer.toApplicationState(convertedGeoJson);
                set(initialGeoJsonDrawState, convertedGeoJson);
                set(metadataDrawState, { [METADATA.title]: title });
                set(vectorMapDrawState, {
                    type: VECTOR_MAP_TYPES.REMOTE,
                    id: null,
                    layerRole: "owner",
                });
                set(horizontalLayoutModeState, HORIZONTAL_LAYOUT_MODE.DRAW);
            },
        []
    );

    return useCallback(
        (title, geoJson, shouldPersist) => {
            if (shouldPersist) {
                return mountNewRemoteGeojsonLayer(title, geoJson);
            } else {
                return mountLocalGeoJsonLayer(title, geoJson);
            }
        },
        [mountLocalGeoJsonLayer, mountNewRemoteGeojsonLayer]
    );
};
