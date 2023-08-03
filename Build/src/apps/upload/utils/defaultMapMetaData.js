const MapTypes = {
    AE: "ae",
    AK: "ak",
    CM: "cm",
    GL: "gl",
    MB: "mb",
    MTB: "mtb",
    TK: "tk",
    TKX: "tkx",
};

export function getDefaultMapMetadata() {
    return {
        allow_download: true,
        default_crs: null,
        description: "",
        license: "CC-BY-SA 4.0",
        link_zoomify: null,
        link_thumb_small: null,
        link_thumb_mid: null,
        map_type: MapTypes.AK,
        map_scale: 25000,
        measures: null,
        owner: null,
        permalink: null,
        ppn: null,
        technic: null,
        time_of_publication: "1899-01-01T00:00:00",
        title: "",
        title_serie: null,
        title_short: "",
        type: null,
    };
}
