/**
 * This encapsulates the options parameter for the app and allows a proper using
 * of the google closure compiler.
 *
 * Created by mendt on 12.11.15.
 */
goog.provide('vk2.settings');

/**
 * When called updates the complete settings with params from the vk2x.settings namespace
 *
 * @param {string} key
 * @returns {*}
 * @export
 */
vk2.settings.updateSettings = function() {
    vk2.settings.ELASTICSEARCH_NODE = vk2x.settings.ELASTICSEARCH_NODE;
    vk2.settings.ELASTICSEARCH_SRS = vk2x.settings.ELASTICSEARCH_SRS;
    vk2.settings.EVALUATION_GETPROCESS = vk2x.settings.EVALUATION_GETPROCESS;
    vk2.settings.EVALUATION_SETISINVALIDE = vk2x.settings.EVALUATION_SETISINVALIDE;
    vk2.settings.EVALUATION_SETISVALIDE = vk2x.settings.EVALUATION_SETISVALIDE;
    vk2.settings.GEOREFERENCE_CONFIRM = vk2x.settings.GEOREFERENCE_CONFIRM;
    vk2.settings.GEOREFERENCE_EXTENT_SRS = vk2x.settings.GEOREFERENCE_EXTENT_SRS;
    vk2.settings.GEOREFERENCE_GETPROCESS = vk2x.settings.GEOREFERENCE_GETPROCESS;
    vk2.settings.GEOREFERENCE_HISTORY = vk2x.settings.GEOREFERENCE_HISTORY;
    vk2.settings.GEOREFERENCE_INFORMATION = vk2x.settings.GEOREFERENCE_INFORMATION;
    vk2.settings.GEOREFERENCE_ON = vk2x.settings.GEOREFERENCE_ON;
    vk2.settings.GEOREFERENCE_PAGE = vk2x.settings.GEOREFERENCE_PAGE;
    vk2.settings.GEOREFERENCE_VALIDATION = vk2x.settings.GEOREFERENCE_VALIDATION;
    vk2.settings.MAIN_PAGE = vk2x.settings.MAIN_PAGE;
    vk2.settings.MAPPROFILE_PAGE = vk2x.settings.MAPPROFILE_PAGE;
    vk2.settings.MAPVIEW_PARAMS = vk2x.settings.MAPVIEW_PARAMS;
    vk2.settings.MODE_3D = vk2x.settings.MODE_3D;
    vk2.settings.OSM_URLS = vk2x.settings.OSM_URLS.length > 0 && vk2x.settings.OSM_URLS[0] !== "" ? vk2x.settings.OSM_URLS : [
        '//a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        '//b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        '//c.tile.openstreetmap.org/{z}/{x}/{y}.png'];
    vk2.settings.TERRAIN_TILES_URL = vk2x.settings.TERRAIN_TILES_URL;
    vk2.settings.THUMB_PATH = vk2x.settings.THUMB_PATH;
    vk2.settings.TMS_URL_SUBDOMAINS = vk2x.settings.TMS_URL_SUBDOMAINS;
    vk2.settings.NOMINATIM_URL = vk2x.settings.NOMINATIM_URL;
    vk2.settings.WITH_SPEAKING_URLS = vk2x.settings.WITH_SPEAKING_URLS;
    vk2.settings.WMS_DYNAMIC_TEMPLATE = vk2x.settings.WMS_DYNAMIC_TEMPLATE;
};

/**
 * @type {string}
 */
vk2.settings.ELASTICSEARCH_NODE;

/**
 * @type {string}
 */
vk2.settings.ELASTICSEARCH_SRS;

/**
 * @type {string}
 */
vk2.settings.EVALUATION_GETPROCESS;

/**
 * @type {string}
 */
vk2.settings.EVALUATION_SETISINVALIDE;

/**
 * @type {string}
 */
vk2.settings.EVALUATION_SETISVALIDE;

/**
 * @type {string}
 */
vk2.settings.GEOREFERENCE_CONFIRM;

/**
 * @type {string}
 */
vk2.settings.GEOREFERENCE_EXTENT_SRS;

/**
 * @type {string}
 */
vk2.settings.GEOREFERENCE_GETPROCESS;

/**
 * @type {string}
 */
vk2.settings.GEOREFERENCE_HISTORY;

/**
 * @type {string}
 */
vk2.settings.GEOREFERENCE_INFORMATION;

/**
 * @type {boolean}
 */
vk2.settings.GEOREFERENCE_ON;

/**
 * @type {string}
 */
vk2.settings.GEOREFERENCE_PAGE;

/**
 * @type {string}
 */
vk2.settings.GEOREFERENCE_VALIDATION

/**
 * @type {string}
 */
vk2.settings.MAIN_PAGE;

/**
 * @type {string}
 */
vk2.settings.MAPPROFILE_PAGE;

/**
 * @type {string}
 */
vk2.settings.MAPVIEW_PARAMS;

/**
 * @type {boolean}
 */
vk2.settings.MODE_3D = false;

/**
 * @type {Array.<string>}
 */
vk2.settings.OSM_URLS;

/**
 * @type {string}
 */
vk2.settings.TERRAIN_TILES_URL;

/**
 * @type {string}
 */
vk2.settings.THUMB_PATH;

/**
 * @type {Array.<string>}
 */
vk2.settings.TMS_URL_SUBDOMAINS;

/**
 * @type {string}
 */
vk2.settings.NOMINATIM_URL;

/**
 * @type {string}
 */
vk2.settings.WITH_SPEAKING_URLS;

/**
 * @type {string}
 */
vk2.settings.WMS_DYNAMIC_TEMPLATE;