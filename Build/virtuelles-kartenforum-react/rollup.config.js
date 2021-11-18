/**
 * @class       : rollup.config
 * @author      : nicolas (nicolas.looschen@pikobytes.de)
 * @created     : Donnerstag Nov 18, 2021 15:37:17 CET
 * @description : rollup.config
 */

import defaultConfig from "./rollup.default.config";
import geoRefConfig from "./rollup.georef.config";
import mapViewConfig from "./rollup.mapview.config";

export default (commandlineArgs) => {
    if (commandlineArgs.configGeoref === true) {
        return geoRefConfig;
    } else if (commandlineArgs.configMapView === true) {
        return mapViewConfig;
    }

    return defaultConfig;
};
