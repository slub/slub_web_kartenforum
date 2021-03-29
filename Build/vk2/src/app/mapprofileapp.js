goog.provide('vk2.app.MapProfileApp');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.net.XhrIo');
goog.require('vk2.control.ImageManipulation');
goog.require('vk2.parser.ElasticSearch');
goog.require('vk2.request.ElasticSearch');
goog.require('vk2.settings');
goog.require('vk2.tool.MetadataBinding');
goog.require('vk2.utils');
goog.require('vk2.viewer.ZoomifyViewer');
goog.require('vk2.viewer.ZoomifyViewerEventType');

/**
 * @export
 * @constructor
 * @param {Object} settings
 * 		{string} metadataContainer
 * 		{string} zoomifyContainer
 *  	{string} titleshortId
 *  	{string} titlelongId
 *  	{string} linkToFotothekId
 */
vk2.app.MapProfileApp = function(settings){

    var feature = document.createElement('textarea');
	feature.innerHTML = settings['feature'];;

    this.initApp_(feature.value, settings);

};

/**
 * @param {ol.Feature} feature
 * @param {Object} settings
 */
vk2.app.MapProfileApp.prototype.initApp_ = function(feature, settings) {
	var mapProperties = JSON.parse(feature);

	// fix the ZoomifyUrl in the art, that from zoomifyUrl, which are prefixed with http: the http: is removed.
	var fixZoomifyUrl = mapProperties['zoomify'].replace('http:', '');

	if (!ol.has.WEBGL){
		// load the hole application with a canvas renderer
		var zoomifyViewer = new vk2.viewer.ZoomifyViewer(settings['zoomifyContainer'], fixZoomifyUrl);
		return;
	};

	// first the access-origin-allow header has to be reset for the zoomify tiles
	// load the hole application with a webgl renderer
	var zoomifyViewer = new vk2.viewer.ZoomifyViewer(settings['zoomifyContainer'], fixZoomifyUrl, true);

	// append image manipulation tool
	goog.events.listen(zoomifyViewer, vk2.viewer.ZoomifyViewerEventType.LOADEND, function(event){
		zoomifyViewer.getMap().addControl(new vk2.control.ImageManipulation());
	});

	return;
};
