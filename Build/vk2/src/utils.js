goog.provide('vk2.utils');

goog.require('goog.Uri');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.net.cookies');
goog.require('goog.net.XhrIo');

goog.require('vk2.utils.Modal');

/**
 * Functions adds a lazy loading behavior to a given array of elements
 * 
 * @param {Array.<Element>} elements
 */
vk2.utils.addLazyLoadingBehavior = function(elements) {
	
	var $window = $(window),
		isElementInViewport = function(el) {
			var a = $window.scrollTop(),
	        	b = $window.height(),
	        	c = $(el).offset().top,
	        	d = $(el).height();
        
			return c + d >= a && c <= a + b;
		}
};

/**
 * Functions adds an open close behavior to a given set of parameters.
 *
 * @param {Element} eventEl
 * @param {Element} displayEl
 * @param {Element} classEl
 * @param {string=} opt_className
 * @param {string=} opt_titleOpen
 * @param {string=} opt_titleClose
 */
vk2.utils.addOpenCloseBehavior = function(eventEl, displayEl, classEl, opt_className, opt_titleOpen, opt_titleClose) {
	var className = goog.isDef(opt_className) ? opt_className : 'active',
		openTitle = goog.isDef(opt_titleOpen) ? opt_titleOpen : '',
		closeTitle = goog.isDef(opt_titleClose) ? opt_titleClose : '';

	goog.events.listen(eventEl,'click', function(event){
		event.preventDefault();

		if (goog.dom.classes.has(classEl, className)){
			goog.dom.classes.remove(classEl, className);
			eventEl['title'] = openTitle;
		} else {
			goog.dom.classes.add(classEl, className);
			eventEl['title'] = closeTitle;
		};
	});
};

/**
 * @static
 * @param {ol.Map} map
 * @return {Array.<number>}
 */
vk2.utils.calculateMapExtentForPixelViewport = function(map){
	var padding = 30;
	var offsetTop = 5;
	var offsetBottom = 25;
	
	// this is a premise
	var spatialsearchSize = goog.style.getSize(goog.dom.getElement('spatialsearch-container'));
	var layermanagementSize = goog.style.getSize(goog.dom.getElement('layermanagement-container'));
	var mapSize = goog.style.getSize(goog.dom.getElement('mapdiv'));
	
	// calculate pixelextent
	var lowX = 0 + spatialsearchSize.width + padding;
	var lowY = mapSize.height - offsetBottom - padding;
	var highX = mapSize.width - layermanagementSize.width - padding;
	var highY = offsetTop + padding;
	
	// get equivalent coordinates
	var llc = map.getCoordinateFromPixel([lowX, lowY]);
	var urc = map.getCoordinateFromPixel([highX, highY]);
	return [llc[0],llc[1],urc[0],urc[1]];
};

/**
 * This function checks if cookies are enabled
 * @static
 */
vk2.utils.checkIfCookiesAreEnabble = function(){
	if (!navigator.cookieEnabled)
		alert('For proper working of the virtuel map forum 2.0 please activate cookies in your browser');
	
	if (goog.DEBUG) {
		console.log('Cookies are enabled');		
	};
};

/**
 * This function parse the query parameters of the given href. If href is undefined it tooks the actual window.location.href 
 * @param {string=} href
 * @return {goog.Uri.QueryData}
 * @static
 */
vk2.utils.getAllQueryParams = function(href){
	if (goog.isDef(href)){
		var url = new goog.Uri(href);
	} else {
		var url = new goog.Uri(window.location.href);
	}

	return url.getQueryData();
};

/**
 * @param {Element} element
 * @param {string} className
 */
vk2.utils.getClosestParentElementForClass = function(element, className){
	var element = goog.dom.classes.has(element, className) ? element : 
		vk2.utils.getClosestParentElementForClass(goog.dom.getParentElement(element), className);
	return element;
};

/**
 * 
 * This function encapsulate the json lang_dictionary from the locale javascript folder.
 * @static
 * @param {string=} opt_key
 * @return {string}
 */
vk2.utils.getMsg = function(opt_key){
	if (!goog.isDef(opt_key))
		return '';
	
	try{
		if (goog.isDef(window['lang_dictionary'])) return window['lang_dictionary'][opt_key];
	} catch (ReferenceError){
		if (goog.DEBUG)
			console.log('Could not found dictionary.');
		return '';
	};
};

/**
 * @param {Array.<number>} extent
 * @return {Array.<Array.<number>>}
 */
vk2.utils.getPolygonFromExtent = function(extent){
	return [[extent[0],extent[1]], [extent[0],extent[3]], [extent[2],extent[3]], [extent[2],extent[1]], [extent[0],extent[1]]];
};

/**
 * This function parse for the given href the query parameter with the given name. If href is undefined it tooks the 
 * actual window.location.href
 * @param {string} name
 * @param {string=} opt_href
 * @return {*}
 * @expose
 * @static
 */
vk2.utils.getQueryParam = function(name, opt_href){
	if (goog.isDef(opt_href)){
		return vk2.utils.getAllQueryParams(opt_href).get(name);
	} else {
		return vk2.utils.getAllQueryParams().get(name);
	}
};

/**
 * @param {string} name
 */
vk2.utils.getCookie = function(name){
	return goog.net.cookies.get(name);
}

/**
 * @param {string=} title
 * @param {string=} message
 * @param {Function=} opt_submitCallback
 * @param {string=} opt_classNames
 * @param {boolean=} opt_withoutBtns
 */
vk2.utils.getConfirmationDialog = function(title, message, opt_submitCallback, opt_classNames, opt_withoutBtns){
	var modal = new vk2.utils.Modal('vk2-overlay-modal',document.body, true),
		title = title,
		classes = goog.isDef(opt_classNames) ? opt_classNames : '',
		msg = message,
		withBtns = goog.isDef(opt_withoutBtns) ? opt_withoutBtns : true,
		bodyContent = withBtns == true ? '<button type="button" class="btn btn-primary" id="confirm-dialog-btn-yes"' +
			'>' + vk2.utils.getMsg('yes') + '</button><button type="button" class="btn btn-primary"' +
			'id="confirm-dialog-btn-no">' + vk2.utils.getMsg('no') + '</button>' : '';
	
	modal.open(title, classes);
	modal.appendStringToBody('<p>' + msg + '</p><br>' + bodyContent);

	if (withBtns == true) {
		var callback = goog.isDef(opt_submitCallback) ? opt_submitCallback : function(){};
		goog.events.listen(goog.dom.getElement('confirm-dialog-btn-yes'), 'click', function(event){callback();modal.close();});
		goog.events.listen(goog.dom.getElement('confirm-dialog-btn-no'), 'click', function(event){modal.close();});
	}

};

/**
 * Helper Function which access the ol3d object, which is hidden in the global namespace.
 * @return {olcs.OLCesium|undefined}
 */
vk2.utils.getOL3D = function() {
	if (vk2.utils.is3DMode())
		return window['ol3d'];
	return;
};

/**
 * Function checks if the client is logged in. This is checked via the
 * presence of the auth_tkt cookie.
 * @return {boolean}
 */
vk2.utils.isLoggedIn = function(){
	return goog.isDef(goog.net.cookies.get('auth_tkt')) ? true : false;
};

/**
 * Helper function which checks if an 3d perspective is open yet
 * @return {boolean}
 */
vk2.utils.is3DMode = function() {
	return vk2.settings.MODE_3D && window['ol3d']  !== undefined;
};

/**
 * @param {string} className
 * @param {Object=} opt_element
 * @static
 */
vk2.utils.loadModalOverlayBehavior = function(className, opt_element){
	var parent_el = goog.isDef(opt_element) ? opt_element : document.body;
	var modal_anchors = goog.dom.getElementsByClass(className, parent_el.body);
	
	// iteratore over modal_anchors and init the behavior for them
	for (var i = 0; i < modal_anchors.length; i++){
		goog.events.listen(modal_anchors[i], goog.events.EventType.CLICK, function(e){
			e.preventDefault();
			
			try {	
				var modal = new vk2.utils.Modal('vk2-overlay-modal',document.body, true);
				
				// parse the modal parameters
				var title = this['title'];
				var classes = this.getAttribute('data-classes');
				var href = this.href;
	
				modal.open(title, classes, {
					'href':href,
					'classes':classes
				});
				
				// stopping the default behavior of the anchor 
				e.preventDefault();
			} catch (e) {
				if (goog.DEBUG){
					console.log('Error while trying to load remote page in modal.');
				}
			};
		});
	};
};

/**
 * Functions refreshs the 3d view
 */
vk2.utils.refresh3DView = function() {
	if (vk2.utils.is3DMode() && vk2.utils.getOL3D().getEnabled() === true) {
		vk2.utils.getOL3D().getAutoRenderLoop().restartRenderLoop();
	};
};

/**
 * Function rounds a float number to a given decimal position
 * @param {number} x
 * @param {number} opt_decimalPosition 
 * @return {number}
 */
vk2.utils.round = function(x, opt_decimalPosition) {
	var d = goog.isDef(opt_decimalPosition) ? Math.pow(10, Math.ceil(opt_decimalPosition)) : Math.pow(10, 2);
	return Math.round(x*d) / d;
};

/**
 * @param {string} map_container
 * @static
 */
vk2.utils.overwriteOlTitles = function(map_container){
	var elements = goog.dom.getElementByClass('ol-overlaycontainer-stopevent', goog.dom.getElement(map_container));
	for (var i = 0; i < elements.children.length; i++){
		var childElement = elements.children[i];
		if (goog.dom.classes.has(childElement.children[0], 'ol-has-tooltip')){
			var tooltipEls = goog.dom.getElementsByClass('ol-has-tooltip', childElement);
			for (var j = 0; j < tooltipEls.length; j++){
				var tooltipText = tooltipEls[j].children[0].innerHTML;
				tooltipEls[j].setAttribute('title', tooltipText);
			};
		};
	};
};

/**
 * This functions does a get request for a given url_string and calls, if given, the success_callback or error_callback
 * @param {string} url_string
 * @param {Function=} success_callback
 * @param {Function=} error_callback
 * @static
 */
vk2.utils.sendReport = function(url_string, success_callback, error_callback){
	
	// create request object
	var xhr = new goog.net.XhrIo();
	
	// add listener to request object
	goog.events.listenOnce(xhr, 'success', function(e){
		var xhr = /** @type {goog.net.XhrIo} */ (e.target);
		if (goog.isDef(success_callback))
			success_callback(xhr);
		xhr.dispose();

	});
	
	goog.events.listenOnce(xhr, 'error', function(e){
		var xhr = /** @type {goog.net.XhrIo} */ (e.target);
		if (goog.isDef(error_callback))
			error_callback(xhr);
	});
	
	// send request
	xhr.send(url_string);	
};


/**
 * @export
 * @param {string} name
 * @param {string} value
 */
vk2.utils.setCookie = function(name, value){
	goog.net.cookies.set(name, value, undefined, '/');
}

/**
 * @static
 */
vk2.utils.setProxyUrl = function(){
	var origin = window.location.origin;
	// for opera 
	if (!window.location.origin)
		origin = window.location.protocol+'//'+window.location.host;
	
	vk2.settings.PROXY_URL = origin+'/vkviewer/proxy/?url=';
	
	if (goog.DEBUG)
		console.log('Proxy url is: '+vk2.settings.PROXY_URL);
};

/**
 * @param {Element} parentEl
 * @param {number} points
 * @static
 */
vk2.utils.showAchievedPoints = function(parentEl, points){
	var container = goog.dom.createDom('div',{
		'class':'georef-point-container alert alert-warning',
		'style':'display:none;'
	});
	goog.dom.appendChild(parentEl, container);
	
	container.innerHTML = '+' + points + ' ' + vk2.utils.getMsg('points')
	$(container).fadeIn(1000).effect('puff', {}, 3000, function(){
		container.innerHTML = '';
	});
};

/**
 * This method is used for transforming geo coordinates to pixel coordinates. This is used for 
 * correct transform from client side coordinates to the server side standard.
 * 
 * @param {Array.<number>} pixel_coordinates
 * @private
 * @returns {Array.<number>}
 */
vk2.utils.transformGeoCoordsToPixel = function(pixel_coordinates){
	return [Math.round(pixel_coordinates[0]), Math.round(-1*pixel_coordinates[1])];
};

/**
 * This method is used for transforming pixel coordinates to geo coordinates. This is used for 
 * correct displaying of server sides pixel in the client map.
 * 
 * @param {Array.<number>} pixel_coordinates
 * @private
 * @returns {Array.<number>}
 */
vk2.utils.transformPixelToGeoCoords = function(pixel_coordinates){
	return [Math.round(pixel_coordinates[0]), Math.round(-1*pixel_coordinates[1])];
};