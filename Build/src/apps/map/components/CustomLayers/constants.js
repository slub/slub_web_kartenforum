/*
 * Created by tom.schulze@pikobytes.de on 01.10.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

export const METADATA = {
    id: "id",
    timePublished: "time_published",
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

    // Internally used
    type: "type",

    // Vector map specific metadata
    vectorMapId: "vector_map_id",
    version: "version",
    userRole: "user_role",
};

export const MAP_LIBRE_METADATA = {
    id: "vkf:layer_id",
};

export const LAYER_TYPES = {
    HISTORIC_MAP: "historic_map",
    MOSAIC_MAP: "mosaic",
    VECTOR_MAP: "vector",

    // Deprecated
    LEGACY_GEOJSON: "geojson",
};
