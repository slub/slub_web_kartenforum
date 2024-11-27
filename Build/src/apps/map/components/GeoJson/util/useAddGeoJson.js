/**
 * Created by nicolas.looschen@pikobytes.de on 26.11.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { useRecoilCallback } from "recoil";
import {
    addGeoJsonDialogState,
    mapState,
    selectedGeoJsonLayerIdState,
    selectedLayersState,
} from "@map/atoms";
import { isDefined, translate } from "@util/util";
import { GeoJsonLayer, METADATA } from "@map/components/CustomLayers";
import { notificationState } from "@atoms";

export const useAddGeoJson = () => {
    const addGeoJson = useRecoilCallback(
        ({ snapshot, set }) =>
            async (title, geoJSON, selectAfterCreate = false) => {
                const map = await snapshot.getPromise(mapState);
                if (isDefined(map)) {
                    try {
                        const metadata = {
                            [METADATA.title]: title,
                            // [METADATA.timeChanged]: refGeoJSON.current.modified,
                        };

                        const geoJSONLayer = new GeoJsonLayer({
                            metadata,
                            geoJSON,
                        });

                        geoJSONLayer.addLayerToMap(map);

                        set(selectedLayersState, (oldSelectedLayers) => [
                            ...oldSelectedLayers,
                            geoJSONLayer,
                        ]);

                        if (selectAfterCreate) {
                            set(
                                selectedGeoJsonLayerIdState,
                                geoJSONLayer.getId()
                            );
                        }
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

    return addGeoJson;
};
