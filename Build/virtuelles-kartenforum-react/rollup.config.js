/**
 * Created by nicolas.looschen@pikobytes.de on 16.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import appsViewConfig from "./rollup.apps.config";
import geoRefConfig from "./rollup.georef.config";
import mapViewConfig from "./rollup.mapview.config";

export default (commandlineArgs) => {
    if (commandlineArgs.configGeoref === true) {
        return geoRefConfig;
    } else if (commandlineArgs.configMap === true) {
        return mapViewConfig;
    } else if (commandlineArgs.configApps == true) {
        return appsViewConfig;
    }

    return [geoRefConfig, mapViewConfig, appsViewConfig];
};
