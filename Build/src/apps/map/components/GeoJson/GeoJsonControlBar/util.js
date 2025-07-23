/*
 * Created by tom.schulze@pikobytes.de on 08.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { isDefined, translate } from "@util/util";

export const getFormattedFeatureCount = (geoJson) => {
    if (!isDefined(geoJson?.features?.length)) {
        return `${translate("geojson-control-bar-no-features")}`;
    }

    const featureCount = geoJson.features.length;

    if (featureCount > 1) {
        return `${featureCount} ${translate(
            "geojson-control-bar-feature-plural"
        )}`;
    }

    if (featureCount === 1) {
        return `1 ${translate("geojson-control-bar-feature")}`;
    }

    return `${translate("geojson-control-bar-no-features")}`;
};
