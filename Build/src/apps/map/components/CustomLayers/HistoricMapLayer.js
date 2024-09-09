/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { bbox } from "@turf/bbox";

import { isDefined } from "../../../../util/util";

export const addHistoricMapLayer = (settings, map) => {
    const bounds = settings.clip ? bbox(settings.clip) : undefined;

    const metadata = {
        "vkf:id": isDefined(settings.id) ? settings.id : undefined,
        "vkf:time_published": settings.time_published,
        "vkf:title": isDefined(settings.title) ? settings.title : undefined,
        "vkf:thumb_url": settings.thumb_url,
        "vkf:allowUseInLayerManagement": true,
        "vkf:type": settings.type,
        "vkf:bounds": bounds,
    };

    const sourceSettings =
        settings.tms_urls !== undefined
            ? {
                  maxzoom: settings.maxZoom,
                  tiles: settings.tms_urls.map(
                      (url) => `${url}/{z}/{x}/{y}.png`
                  ),
                  scheme: "tms",
              }
            : settings.wms_settings;

    const sourceId = settings.sourceId;

    map.addSource(sourceId, {
        type: "raster",
        ...sourceSettings,
        bounds,
    });
    map.addLayer({ id: sourceId, type: "raster", metadata, source: sourceId });
};
