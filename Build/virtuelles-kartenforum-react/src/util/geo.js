/**
 * Created by jacob.mendt@pikobytes.de on 11.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import proj4 from "proj4js";
import { register } from "ol/src/proj/proj4";

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
