goog.provide('vk2.layer.HistoricMap3D');

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
 * @param {vk2x.layer.HistoricMap3DOptions} settings
 * @param {ol.Map} map
 * @param {boolean=} opt_3d
 * @constructor
 * @extends {ol.layer.Group}
 */
vk2.layer.HistoricMap3D = function(settings, map, opt_3d){

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

	settings['extent'] = settings['clip'].getExtent();
	settings['source'] = new ol.source.XYZ({
		'maxZoom': settings['maxZoom'],
		'urls': urls,
		'crossOrigin': '*'
	});

	ol.layer.Tile.call(this, settings);
};
ol.inherits(vk2.layer.HistoricMap3D, ol.layer.Tile);

/**
 * @return {number}
 */
vk2.layer.HistoricMap3D.prototype.getTime = function(){
	return this.time_;
};

/**
 * @return {string}
 */
vk2.layer.HistoricMap3D.prototype.getTitle = function(){
	return this.title_;
};

/**
 * @return {string}
 */
vk2.layer.HistoricMap3D.prototype.getThumbnail = function(){
	return this.thumb_;
};

/**
 * @return {string}
 */
vk2.layer.HistoricMap3D.prototype.getId = function(){
	return this.id_;
};