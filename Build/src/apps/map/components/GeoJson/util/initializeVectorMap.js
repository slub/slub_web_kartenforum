/*
 * Created by tom.schulze@pikobytes.de on 07.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { getVectorMap } from "./apiVectorMaps";
import { GeoJsonLayer, METADATA } from "@map/components/CustomLayers";
import axios from "axios";

const initializeExternalVectorMap = async (layer) => {
    const url = layer.getMetadata(METADATA.externalContentUrl);
    const headers = { accept: "application/json" };
    const result = await axios.get(url, { headers });

    const geoJson = GeoJsonLayer.toApplicationState(result.data);
    layer.setGeoJson(geoJson);
};

const initializePersistentVectorMap = async (layer) => {
    const vectorMap = await getVectorMap(
        layer.getMetadata(METADATA.vectorMapId)
    );

    layer.updateMetadata(METADATA.userRole, vectorMap[METADATA.userRole]);
    layer.updateMetadata(METADATA.version, vectorMap[METADATA.version]);

    layer.setGeoJson(vectorMap.geojson);
};

const initializeVectorMap = async (layer) => {
    if (layer.isExternalVectorMap()) {
        await initializeExternalVectorMap(layer);
        return;
    }

    await initializePersistentVectorMap(layer);
};

export { initializeVectorMap };
