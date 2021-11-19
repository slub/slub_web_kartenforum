/**
 * Created by nicolas.looschen@pikobytes.de on 16.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import geoRefConfig from "./rollup.georef.config";
import mapViewConfig from "./rollup.mapview.config";

export default (commandlineArgs) => {
    if (commandlineArgs.configGeoref === true) {
        return geoRefConfig;
    } else if (commandlineArgs.configMapView === true) {
        return mapViewConfig;
    }

    return [geoRefConfig, mapViewConfig];
};
