/**
 * Created by jacob.mendt@pikobytes.de on 11.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import TileWMS from "ol/source/TileWMS";

/**
 * Factory function for creating base map layer. Sets a special flag parameter on the newly created layer
 * for proper detection later on.
 *
 * @param {string} id
 * @param {string} type
 * @param {string|[]>} urls
 * @param {number} tileSize
 * @param {string} layers
 * @returns {ol.layer.Tile}
 */
export function createBaseMapLayer({
    id,
    type,
    urls,
    tileSize = 256,
    layers = "",
}) {
    if (type !== "vector" && type !== "wms") {
        throw new Error(
            "Currently only 'vector' and 'wms' schema are supported as basemaps."
        );
    }

    const newSource =
        type === "xyz"
            ? new XYZ({
                  crossOrigin: "*",
                  maxZoom: 18,
                  tileSize: tileSize,
                  urls: urls,
              })
            : new TileWMS({
                  url: urls[0],
                  params: { LAYERS: layers },
              });

    // Set an vkf_id to the layer
    const newBaseMapLayer = new TileLayer({ source: newSource });
    newBaseMapLayer.vkf_id = id;
    newBaseMapLayer.vkf_type = "basemap";

    return newBaseMapLayer;
}
