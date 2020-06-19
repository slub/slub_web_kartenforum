goog.provide('vk2.georeference.GeoreferencerService');

goog.require('goog.net.XhrIo');
goog.require('vk2.settings');
goog.require('vk2.utils.routing');

/**
 * @static
 * @param {Object} data
 * @param {Function=} success_callback
 * @param {Function=} error_callback
 */
vk2.georeference.GeoreferencerService.requestValidationResult = function(data, success_callback, error_callback){
	if (goog.DEBUG){
		console.log('Validation request: ');
		console.log(data);
	};
	
	/**
	 * @param {goog.events.Event} response
	 */
	var callback = function(response){
		if (response.target.getStatus() === 200){
			success_callback(response);
			return;
		};
		error_callback(response);
		return;
	};
	
	goog.net.XhrIo.send(vk2.utils.routing.getGeorefValidationRoute(), 
			callback, 'POST', 'req=' + JSON.stringify(data));	
	return undefined;
};

/**
 * @static
 * @param {Object} data
 * @param {Function=} success_callback
 * @param {Function=} error_callback
 */
vk2.georeference.GeoreferencerService.requestConfirmResult = function(data, success_callback, error_callback){
	if (goog.DEBUG){
		console.log('Confirmation request: ');
		console.log(data);
	};
	
	goog.net.XhrIo.send(vk2.utils.routing.getGeorefConfirmationRoute(), success_callback, 'POST', 'req=' + JSON.stringify(data));	
	return undefined;
};
