/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { MAP_LIBRE_METADATA, METADATA } from "../constants.js";
import { MAP_OVERLAY_FILL_ID } from "@map/components/MapSearch/components/MapSearchOverlayLayer/MapSearchOverlayLayer.jsx";

export const addHistoricMapLayer = (
    historicMapLayer,
    map,
    sourceSettings,
    layerSettings
) => {
    const applicationLayerId = historicMapLayer.getId();

    map.addSource(applicationLayerId, {
        type: "raster",
        ...sourceSettings,
        bounds: historicMapLayer.getMetadata(METADATA.bounds),
    });

    const beforeLayer =
        map.getLayer(MAP_OVERLAY_FILL_ID) !== undefined
            ? MAP_OVERLAY_FILL_ID
            : undefined;

    map.addLayer(
        {
            id: applicationLayerId,
            type: "raster",
            metadata: { [MAP_LIBRE_METADATA.id]: applicationLayerId },
            source: applicationLayerId,
            layout: {
                visibility: layerSettings?.visibility ?? "visible",
            },
            paint: {
                "raster-opacity": layerSettings?.opacity ?? 1,
            },
        },
        beforeLayer
    );
};
