/*
 * Created by tom.schulze@pikobytes.de on 01.10.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

export const METADATA = {
    id: "id",
    timeChanged: "time_changed",
    title: "title",
    thumbnailUrl: "thumb_url",
    bounds: "bounds",
    hasGeoReference: "has_georeference",
    tmsUrls: "tms_urls",
    onlineResources: "online_resources",
    mapScale: "map_scale",
    rawMapIds: "raw_map_ids",
    name: "name",
    description: "description",
    timePeriod: "time_period",
    externalContentUrl: "external_content_url",
    externalContentType: "external_content_type",

    // Internally used
    type: "type",

    // Vector map specific metadata
    vectorMapId: "vector_map_id",

    // Persistent vector map specific metadata
    version: "version",
    userRole: "user_role",
};

export const MAP_LIBRE_METADATA = {
    id: "vkf:layer_id",
    contentType: "vkf:content_type",
};

export const EXTERNAL_CONTENT_TYPES = {
    VKF: "vkf:geojson-spec-v1",
    IDOHIST: "idohist:idohist-v1",
};

export const LAYER_TYPES = {
    HISTORIC_MAP: "historic_map",
    MOSAIC_MAP: "mosaic",
    VECTOR_MAP: "vector",

    // Deprecated
    LEGACY_GEOJSON: "geojson",
};

export const VISIBILITY = {
    VISIBLE: "visible",
    NONE: "none",
};
