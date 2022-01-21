/**
 * Created by jacob.mendt@pikobytes.de on 11.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
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
    if (type !== "xyz" && type !== "wms") {
        throw new Error(
            "Currently only 'xyz' and 'wms' schema are supported as basemaps."
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

export function initializeSupportedCRS() {
    // proj4.defs(
    //     "EPSG:3043",
    //     "+proj=utm +zone=31 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
    // );
    proj4.defs(
        "EPSG:4314",
        "+proj=longlat +ellps=bessel +datum=potsdam +no_defs"
    );
    proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");
    // proj4.defs(
    //     "EPSG:900913",
    //     "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +over no_defs"
    // );
    proj4.defs(
        "EPSG:3857",
        "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"
    );

    register(proj4);
}
