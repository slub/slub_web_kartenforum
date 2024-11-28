/**
 * Created by nicolas.looschen@pikobytes.de on 26.11.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { useRecoilCallback } from "recoil";
import {
    addGeoJsonDialogState,
    editedGeojsonState,
    horizontalLayoutModeState,
    mapState,
    selectedGeoJsonLayerIdState,
    selectedLayersState,
} from "@map/atoms";
import { isDefined, translate } from "@util/util";
import { GeoJsonLayer, METADATA } from "@map/components/CustomLayers";
import { notificationState } from "@atoms";
import { HORIZONTAL_LAYOUT_MODE } from "@map/layouts/util";
import { useCallback } from "react";

export const useAddGeoJson = () => {
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

                        // Create geojson layer
                        const geoJsonLayer = new GeoJsonLayer({
                            metadata,
                            geoJSON: geoJson,
                        });

                        // add layer to map
                        geoJsonLayer.addLayerToMap(map);

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
            }
    );

    // Mount geojson to draw view, without creating an application layer
    const mountNewRemoteGeojsonLayer = useRecoilCallback(
        ({ set }) =>
            async (title, geoJson) => {
                set(editedGeojsonState, geoJson);
                set(horizontalLayoutModeState, HORIZONTAL_LAYOUT_MODE.DRAW);
            }
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
