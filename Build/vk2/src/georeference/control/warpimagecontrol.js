goog.provide('vk2.georeference.control.WarpImageControl');
goog.provide('vk2.georeference.control.WarpImageControlEventType');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');

goog.require('vk2.utils');
goog.require('vk2.georeference.GeoreferencerService');
goog.require('vk2.georeference.utils');

/**
 * @enum
 */
vk2.georeference.control.WarpImageControlEventType = {
	START_WARPING: 'start-warping',
	END_WARPING: 'end-warping',
	ERROR: 'error'
};

/**
 * @param {string} topMenuContainerEl
 * @param {string} objectid
 * @param {vk2.georeference.handler.GcpHandler} gcpHandler
 * @extends {goog.events.EventTarget}
 * @constructor
 */
vk2.georeference.control.WarpImageControl = function(topMenuContainerEl, objectid, gcpHandler){
		
	// create html element
	var controlEl = goog.dom.createDom('div',{
		'class': 'vk2GeorefToolsBtn btn btn-default btn-validate',
		'innerHTML': '<span class="glyphicon glyphicon-refresh"></span> ' + vk2.utils.getMsg('georef-validate')
	});
	goog.dom.appendChild(goog.dom.getElement(topMenuContainerEl), controlEl);
	
	goog.events.listen(controlEl, 'click', goog.bind(this.warpImage_, this, objectid, gcpHandler));
	
	goog.base(this);
};
goog.inherits(vk2.georeference.control.WarpImageControl, goog.events.EventTarget);

/**
 * Methode validates the request params.
 * @param {Object} params
 * @return {boolean}
 * @private
 */
vk2.georeference.control.WarpImageControl.prototype.validateParams_ = function(params) {
	// Not enough ground control points set
	if (params['georeference']['gcps'].length < 4)
		return false;
	return true;
};

/**
 * @param {string} objectid
 * @param {vk2.georeference.GcpHandler} gcpHandler
 * @private
 */
vk2.georeference.control.WarpImageControl.prototype.warpImage_ = function(objectid, gcpHandler){

	// get relevant parameters
	var projection = vk2.georeference.utils.extractProjection('projection-chooser'),
		algorithm = vk2.georeference.utils.extractTransformationAlgorithm('transformation-chooser'),
		newGeorefParams = gcpHandler.getGcpParams(algorithm, projection);

	var requestParams = {
		'georeference': newGeorefParams,
		'id': objectid
	};
	
	if (goog.DEBUG){
		console.log('---------------------------');
		console.log('New georeference parameter:');
		console.log(requestParams);
		console.log('---------------------------');
	};
	
	// validate parametes
	// behavior in case of wrong params could be added
	if (!this.validateParams_(requestParams)) {
		vk2.utils.getConfirmationDialog('Info', vk2.utils.getMsg('georef-confirm-warn-gcp'),
			function() { return; }, 'georef-validation-dialog', false);
		return;
	};
	
	// start warping process
	this.dispatchEvent(new goog.events.Event(vk2.georeference.control.WarpImageControlEventType.START_WARPING, {}));
	
	var success_callback = goog.bind(function(event) {
		if (goog.DEBUG) {
			console.log('Receive validation result ...');
			console.log(event);
		};
		
		var responseData = event.target.getResponseJson();
		
		// end warping process
		this.dispatchEvent(new goog.events.Event(vk2.georeference.control.WarpImageControlEventType.END_WARPING, {'data':responseData, 'georefParams':requestParams}));
	}, this);
	
	var error_callback = goog.bind(function(event){		
		if (goog.DEBUG) {
			console.log('Receive error while requesting validation result ...');
			console.log(event);
		};
		
		// end warping process
		this.dispatchEvent(new goog.events.Event(vk2.georeference.control.WarpImageControlEventType.ERROR, {'error':'Something went wrong, while fetching validation data from the server.'}));
	}, this);
	
	vk2.georeference.GeoreferencerService.requestValidationResult(requestParams, success_callback, error_callback);
	
};
