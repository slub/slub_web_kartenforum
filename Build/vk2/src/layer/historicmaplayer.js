goog.provide('vk2.layer.HistoricMap');

goog.require('goog.events');
goog.require('goog.object');
goog.require('vk2.utils');
goog.require('vk2.utils.Styles');
goog.require('vk2.settings')

/**
 * Right now there are problems with the compiled version when using a ol3 compiled version. In that case
 * renamed variables of this object overwrite properties/function of the inherited object (ol.layer.Group). A
 * solution is to prevent renaming properties of this object through using the "expose" annotation.
 *
 * @param {vk2x.layer.HistoricMapOptions} settings
 * @param {ol.Map} map
 * @constructor
 * @extends {ol.layer.Group}
 */
vk2.layer.HistoricMap = function(settings, map){

	/**
	 * @type {string}
	 * @private
	 * @expose
	 */
	this.id_ = goog.isDef(settings.id) ? settings.id : undefined;

	/**
	 * @type {number}
	 * @private
	 * @expose
	 */
	this.time_ = settings.time;

	/**
	 * @type {string}
	 * @private
	 * @expose
	 */
	this.title_ = goog.isDef(settings.title) ? settings.title : undefined;

	/**
	 * @type {string}
	 * @private
	 * @expose
	 */
	this.thumb_ = goog.isDef(settings.thumbnail) ? settings.thumbnail : vk2.settings.THUMB_PATH;

	/**
	 * @type {boolean}
	 * @expose
	 */
	this.allowUseInLayerManagement = true;

	var urls = [];
	for (var i = 0; i < vk2.settings.TMS_URL_SUBDOMAINS.length; i++){
		var url = settings.tms.replace('{s}', vk2.settings.TMS_URL_SUBDOMAINS[i]) + '/{z}/{x}/{-y}.png';
		urls.push(url.replace('http:', ''));
	};

	var feature = vk2.layer.HistoricMap.createClipFeature(settings['clip'], this.id_, this.time_, this.title_),
		rasterLayer = new ol.layer.Tile({
			'extent': settings['clip'].getExtent(),
			'source': new ol.source.XYZ({
				'maxZoom': settings['maxZoom'],
				'urls': urls,
				'crossOrigin': '*'
			})
		}),
		borderLayer = new ol.layer.Vector({
			source: new ol.source.Vector({
				'features':[ feature ]
			}),
			'style': function(feature, resolution) {
				return [vk2.utils.Styles.MESSTISCHBLATT_BORDER_STYLE];
			}
		});

	settings['layers'] = [rasterLayer, borderLayer];

	ol.layer.Group.call(this, settings);
};
ol.inherits(vk2.layer.HistoricMap, ol.layer.Group);

/**
 * @param {ol.geom.Polygon} clip
 * @param {number} id
 * @param {string} time
 * @param {string} title
 * @return {ol.Feature}
 * @private
 */
vk2.layer.HistoricMap.createClipFeature = function(clip, id, time, title) {

	// create the clip feature
	var feature = new ol.Feature(clip);
	feature.setProperties({
		'objectid':id,
		'time':time,
		'title': title
	});
	feature.setId(id);

	return feature;
};

/**
 * @return {number}
 */
vk2.layer.HistoricMap.prototype.getTime = function(){
	return this.time_;
};

/**
 * @return {string}
 */
vk2.layer.HistoricMap.prototype.getTitle = function(){
	return this.title_;
};

/**
 * @return {string}
 */
vk2.layer.HistoricMap.prototype.getThumbnail = function(){
	return this.thumb_.replace('http:', '');
};

/**
 * @return {string}
 */
vk2.layer.HistoricMap.prototype.getId = function(){
	return this.id_;
};

/**
 * @return {Object}
 */
//vk2.layer.HistoricMap.prototype.getMetadata = function(){
//	return this._metadata;
//};