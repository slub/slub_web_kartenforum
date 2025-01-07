/**
 * Created by nicolas.looschen@pikobytes.de on 26/11/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { isDefined } from "@util/util";
import { LAYER_TYPES, METADATA } from "@map/components/CustomLayers";
import SettingsProvider from "@settings-provider";

export const checkIfArrayContainsLayer = (array, layer) => {
    return (
        array.findIndex(
            (selectedLayer) => selectedLayer.getId() === layer.getId()
        ) !== -1
    );
};

const FALLBACK_SRC =
    "http://www.deutschefotothek.de/images/noimage/image120.jpg";

export const getFallbackSrc = (layer) => {
    const type = layer.getType();
    if (type === LAYER_TYPES.VECTOR_MAP) {
        const settings = SettingsProvider.getSettings();
        return settings.FALLBACK_THUMBNAIL;
    }
    return FALLBACK_SRC;
};

export const getImageSrcFromLayer = (layer) => {
    const thumbnailUrl = layer.getMetadata(METADATA.thumbnailUrl);

    if (!isDefined(thumbnailUrl) || thumbnailUrl === "") {
        return getFallbackSrc(layer);
    }

    return thumbnailUrl.replace("http:", "");
};
