/**
 * Created by nicolas.looschen@pikobytes.de on 24.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { queryDocument } from "@util/apiEs.js";
import { readLayer } from "@util/parser.js";
import { HistoricMapLayer } from "@map/components/CustomLayers";

/**
 * Fetches an application layer based on a map id
 * @param mapId
 * @return {Promise<HistoricMapLayer>}
 */
export const fetchLayerForMapId = (mapId) =>
    queryDocument(mapId)
        .then((res) => readLayer(mapId, res))
        .catch(() => {
            const layer = new HistoricMapLayer({
                metadata: {
                    id: mapId,
                    has_georeference: false,
                },
            });

            layer.setIsMissing(true);
            return layer;
        });
