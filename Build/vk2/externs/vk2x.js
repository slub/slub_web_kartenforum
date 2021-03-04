/**
 * @type {Object}
 */
var vk2x;

/**
 * Namespace
 * @type {Object}
 */
vk2x.layer;

/**
 * authenticate: (boolean)
 * georefChooserContainerId: (string)
 * mapContainerId: (string)
 * modalAnchorClassName: (string)
 * spatialsearchContainerId: (string)
 * with25d: (boolean)
 */
vk2x.app.PresentationAppOptions;

/**
 * @type {boolean}
 */
vk2x.app.PresentationAppOptions.prototype.authenticate;

/**
 * @type {string}
 */
vk2x.app.PresentationAppOptions.prototype.georefChooserContainerId;

/**
 * @type {string}
 */
vk2x.app.PresentationAppOptions.prototype.mapContainerId;

/**
 * @type {string}
 */
vk2x.app.PresentationAppOptions.prototype.modalAnchorClassName;

/**
 * @type {string}
 */
vk2x.app.PresentationAppOptions.prototype.spatialsearchContainerId;

/**
 * @type {boolean}
 */
vk2x.app.PresentationAppOptions.prototype.with25d;

/**
 * @type {Object}
 *  targetEl: (string|Element)
 */
vk2x.app.RankingPageAppOptions;

/**
 * @type {string|Element}
 */
vk2x.app.RankingPageAppOptions.prototype.tableEl;

/**
 * time: (string)
 * border: (Array.<Array.<number>>)
 * extent: (ol.Extent)
 * thumbnail: (string)
 * title: (string)
 * objectid: (string)
 * id: (string)
 * dataid: (string)
 * tms: (string)
 */
vk2x.layer.HistoricMapOptions;

/**
 * @type {Array.<Array.<number>>}
 */
vk2x.layer.HistoricMapOptions.prototype.clip;

/**
 * @type {string}
 */
vk2x.layer.HistoricMapOptions.prototype.dataid;

/**
 * @type {ol.Extent}
 */
vk2x.layer.HistoricMapOptions.prototype.extent;

/**
 * @type {string}
 */
vk2x.layer.HistoricMapOptions.prototype.id;

/**
 * @type {string}
 */
vk2x.layer.HistoricMapOptions.prototype.objectid;

/**
 * @type {string}
 */
vk2x.layer.HistoricMapOptions.prototype.time;

/**
 * @type {string}
 */
vk2x.layer.HistoricMapOptions.prototype.title;

/**
 * @type {string}
 */
vk2x.layer.HistoricMapOptions.prototype.thumbnail;

/**
 * @type {string}
 */
vk2x.layer.HistoricMapOptions.prototype.tms;

/**
 * Namespace
 * @type {Object}
 */
vk2x.settings;

/**
 * @type {string}
 */
vk2x.settings.ELASTICSEARCH_NODE;

/**
 * @type {string}
 */
vk2x.settings.ELASTICSEARCH_SRS;

/**
 * @type {string}
 */
vk2x.settings.EVALUATION_GETPROCESS;

/**
 * @type {string}
 */
vk2x.settings.EVALUATION_SETISINVALIDE;

/**
 * @type {string}
 */
vk2x.settings.EVALUATION_SETISVALIDE;

/**
 * @type {string}
 */
vk2x.settings.GEOREFERENCE_CONFIRM;

/**
 * @type {string}
 */
vk2x.settings.GEOREFERENCE_EXTENT_SRS;

/**
 * @type {string}
 */
vk2x.settings.GEOREFERENCE_GETPROCESS;

/**
 * @type {string}
 */
vk2x.settings.GEOREFERENCE_HISTORY;

/**
 * @type {boolean}
 */
vk2x.settings.GEOREFERENCE_ON;

/**
 * @type {string}
 */
vk2x.settings.GEOREFERENCE_PAGE;

/**
 * @type {string}
 */
vk2x.settings.GEOREFERENCE_VALIDATION

/**
 * @type {string}
 */
vk2x.settings.MAIN_PAGE;

/**
 * @type {string}
 */
vk2x.settings.MAPPROFILE_PAGE;

/**
 * @type {string}
 */
vk2x.settings.MAPVIEW_PARAMS;

/**
 * @type {boolean}
 */
vk2x.settings.MODE_3D;

/**
 * @type {Array.<string>}
 */
vk2x.settings.OSM_URLS;

/**
 * @type {string}
 */
vk2x.settings.SEARCH_TIMEINTERVAL;

/**
 * @type {string}
 */
vk2x.settings.NOMINATIM_URL;

/**
 * @type {string}
 */
vk2x.settings.TERRAIN_TILES_URL;

/**
 * @type {string}
 */
vk2x.settings.THUMB_PATH;

/**
 * @type {Array.<string>}
 */
vk2x.settings.TMS_URL_SUBDOMAINS;

/**
 * @type {string}
 */
vk2x.settings.WITH_SPEAKING_URLS;

/**
 * @type {string}
 */
vk2x.settings.WMS_DYNAMIC_TEMPLATE;

/**
 * Namespace
 * @type {Object}
 */
vk2x.source;

/**
 * projection: (string|undefined)
 * map: (ol.Map)
 * maxFeatures: (number|undefined)
 * time: (Array.<number>|undefined)
 */
vk2x.source.ServerPaginationOptions;

/**
 * @type {string|undefined}
 */
vk2x.source.ServerPaginationOptions.prototype.projection;

/**
 * @type {ol.Map}
 */
vk2x.source.ServerPaginationOptions.prototype.map;

/**
 * @type {number|undefined}
 */
vk2x.source.ServerPaginationOptions.prototype.maxFeatures;

/**
 * @type {Array.<number>|undefined}
 */
vk2x.source.ServerPaginationOptions.prototype.time;
