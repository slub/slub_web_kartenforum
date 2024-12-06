/**
 * Created by nicolas.looschen@pikobytes.de on 05.12.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { useRecoilCallback } from "recoil";
import {
    drawState,
    initialGeoJsonDrawState,
    vectorMapActiveVersionDrawState,
    vectorMapDrawState,
} from "@map/atoms";
import { getVectorMapVersion } from "@map/components/GeoJson/util/apiVectorMaps";
import { geoJsonChangeTrackingState } from "@map/components/GeoJson/util/hooks/useTrackGeoJsonChanges";

export const useRestoreVectorMapVersion = () => {
    return useRecoilCallback(
        ({ snapshot, set }) =>
            async (version) => {
                const vectorMapDraw = await snapshot.getPromise(
                    vectorMapDrawState
                );
                const draw = await snapshot.getPromise(drawState);

                // fetch the content of the version
                const content = await getVectorMapVersion(
                    vectorMapDraw.id,
                    version
                );

                if (draw) {
                    // replace the geojson content in the draw plugin
                    draw.deleteAll().add(content.geojson);

                    // reinitialize tracking state
                    const dirtyMap = new Map();
                    content.geojson.features.forEach((feature) => {
                        dirtyMap.set(feature.id, false);
                    });

                    // set initial state to new content (for correct change tracking)
                    set(initialGeoJsonDrawState, content.geojson);
                    // reset tracking state
                    set(geoJsonChangeTrackingState, {
                        dirtyMap,
                        deleteIds: [],
                        addIds: [],
                    });

                    // mark the new version as active
                    set(
                        vectorMapActiveVersionDrawState,
                        version === vectorMapDraw.version ? null : version
                    );
                }
            },
        []
    );
};
