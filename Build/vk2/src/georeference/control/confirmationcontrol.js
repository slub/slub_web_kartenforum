goog.provide('vk2.georeference.control.ConfirmationControl');
goog.provide('vk2.georeference.control.ConfirmationControlEventType');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');

goog.require('vk2.georeference.GeoreferencerService');
goog.require('vk2.georeference.utils');
goog.require('vk2.settings');
goog.require('vk2.utils');

/**
 * @enum
 */
vk2.georeference.control.ConfirmationControlEventType = {
	START_CONFIRM: 'start-confirm',
	END_CONFIRM: 'end-confirm',
	ERROR: 'error'
};

/**
 * @param {string} topMenuContainerEl
 * @param {string} objectid
 * @param {vk2.georeference.handler.GcpHandler} gcpHandler
 * @param {ol.source.Vector} clipPolygonSource 
 * @extends {goog.events.EventTarget}
 * @constructor
 */
vk2.georeference.control.ConfirmationControl = function(topMenuContainerEl, objectid, gcpHandler, clipPolygonSource){
	
	// create html element
	var controlEl = goog.dom.createDom('div',{
		'class': 'vk2GeorefToolsBtn btn btn-default btn-submit deactivate',
		'innerHTML': '<span class="glyphicon glyphicon-refresh"></span> ' + vk2.utils.getMsg('georef-confirm')
	});
	goog.dom.appendChild(goog.dom.getElement(topMenuContainerEl), controlEl);
	
	goog.events.listen(controlEl, 'click', goog.bind(this.confirmImage_, this, objectid, gcpHandler, clipPolygonSource));
	
	goog.base(this);
};
goog.inherits(vk2.georeference.control.ConfirmationControl, goog.events.EventTarget);



/**
 * @param {string} objectid
 * @param {vk2.georeference.GcpHandler} gcpHandler
 * @param {ol.source.Vector} clipPolygonSource
 * @private
 */
vk2.georeference.control.ConfirmationControl.prototype.confirmImage_ = function(objectid, gcpHandler, clipPolygonSource){
	// start warping process
	this.dispatchEvent(new goog.events.Event(vk2.georeference.control.ConfirmationControlEventType.START_CONFIRM, {}));
		
	// get relevant parameters
	var projection = vk2.georeference.utils.extractProjection('projection-chooser'),
		algorithm = vk2.georeference.utils.extractTransformationAlgorithm('transformation-chooser'),
		newGeorefParams = gcpHandler.getGcpsForRequest(algorithm, projection),
		clipPolygon = clipPolygonSource.getFeatures().length > 0 ?
			clipPolygonSource.getFeatures()[0].getGeometry().clone().transform(vk2.settings.MAPVIEW_PARAMS['projection'], projection) :
			undefined,
		type = gcpHandler.getType();
	
	if (newGeorefParams['gcps'].length < 4) {
		alert("You have to place at least 4 ground control points");
		return;
	}
	
	var requestParams = {
		'georeference': newGeorefParams,
		'id': objectid,
		'type': type
	};

	if (clipPolygon !== undefined)
		requestParams['clip'] = {
			'source':projection,
			'polygon': clipPolygon.getCoordinates()[0]
		};

	if (type === 'update')
		requestParams['overwrites'] = gcpHandler.getOverriteId();
	
	if (goog.DEBUG){
		console.log('---------------------------');
		console.log('New georeference parameter:');
		console.log(requestParams);
		console.log('---------------------------');
	};
		
	var success_callback = goog.bind(function(event) {
		if (goog.DEBUG) {
			console.log('Confirmation request was send successfully ...');
			console.log(event);
		};
		
		var responseData = event.target.getResponseJson();
		
		// end warping process
		this.dispatchEvent(new goog.events.Event(vk2.georeference.control.ConfirmationControlEventType.END_CONFIRM, {'data':responseData}));
	}, this);
	
	var error_callback = goog.bind(function(event){		
		if (goog.DEBUG) {
			console.log('Receive error while sending confirmation request ...');
			console.log(event);
		};
		
		// end warping process
		this.dispatchEvent(new goog.events.Event(vk2.georeference.control.ConfirmationControlEventType.ERROR, {'error':'Something went wrong, while sending confirmation data from the server.'}));
	}, this);

	// if clip polygon is undefined ask user if he really wants to send the params
	if (!requestParams.hasOwnProperty('clip')) {
		vk2.utils.getConfirmationDialog(vk2.utils.getMsg('georef-confirm-clip-title'), vk2.utils.getMsg('georef-confirm-clip-msg'),
			function() {
				vk2.georeference.GeoreferencerService.requestConfirmResult(requestParams, success_callback, error_callback);
			}, 'georeference-confirm-without-clip');
	} else {
		vk2.georeference.GeoreferencerService.requestConfirmResult(requestParams, success_callback, error_callback);
	};
};
