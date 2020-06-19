goog.provide('vk2.app.WelcomePageApp');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.net.EventType');
goog.require('goog.net.XhrIo');
goog.require('goog.style');
goog.require('vk2.settings');
goog.require('vk2.utils');
goog.require('vk2.utils.routing');

/**
 * @export
 * @param {Object} settings
 * 		{string} georefenceElClass
 * 		{string} overallGeorefenceElClass
 * 		{string} relGeoreferenceElClass
 * 		{string} georeferenceUserRankingElId
 * 		{string} deactivateWelcomePageId
 * @constructor
 */
vk2.app.WelcomePageApp = function(settings) {
	
	if (goog.DEBUG) {
		console.log(settings)
	};
	
	var georeferenceEls = settings['georefenceElClass'] !== undefined ? goog.dom.getElementsByClass(settings['georefenceElClass']) : undefined,
		overallGeoreferenceEls = settings['overallGeorefenceElClass'] !== undefined ? goog.dom.getElementsByClass(settings['overallGeorefenceElClass']) : undefined,
		relGeoreferenceEls = settings['relGeoreferenceElClass'] !== undefined ? goog.dom.getElementsByClass(settings['relGeoreferenceElClass']) : undefined,
		georeferenceUserRankingEl = settings['georeferenceUserRankingElId'] !== undefined ? goog.dom.getElement(settings['georeferenceUserRankingElId']) : undefined;

	// append deactivation behavior for welcome page
	$('#' + settings['deactivateWelcomePageId']).change(function(){				
		var welcomePageStatus = $(this).prop('checked') ? 'off' : 'on';
		vk2.utils.setCookie('vk2-welcomepage', welcomePageStatus);
	});

	if (georeferenceEls !== undefined && overallGeoreferenceEls !== undefined && relGeoreferenceEls !== undefined
		&& georeferenceUserRankingEl !== undefined) {
		this.fetchData_(georeferenceEls, overallGeoreferenceEls, relGeoreferenceEls, georeferenceUserRankingEl);
	}
};

/**
 * @param {Object} data
 * @param {Array.<Element>} georeferenceEls
 * @param {Array.<Element>} overallGeoreferenceEls
 * @param {Array.<Element>} relGeoreferenceEls
 * @param {Element} georeferenceUserRankingEl
 * @private
 */
vk2.app.WelcomePageApp.prototype.displayData_ = function(data, georeferenceEls, overallGeoreferenceEls, 
		relGeoreferenceEls, georeferenceUserRankingEl) {
	
	var georeferencedMapCount = data['georeference_map_count'],
		overallMaps = georeferencedMapCount + data['missing_georeference_map_count'],
		relGeoreference = parseInt(100 * (georeferencedMapCount / overallMaps));
		
	
	// update welcome page
	this.updateInnerHTML_(georeferenceEls, georeferencedMapCount);
	this.updateInnerHTML_(overallGeoreferenceEls, overallMaps);
	this.updatePrograssbarStyle_(relGeoreferenceEls, relGeoreference);
	
	// display rankings
	var loops = Math.min(data['pointoverview'].length, 3);
	for (var i = 0; i < loops; i++) {
		var record = data['pointoverview'][i],
			id = record.hasOwnProperty('username') ? record['username'] : record['userid'];

		goog.dom.appendChild(georeferenceUserRankingEl, goog.dom.createDom('li', {
			'innerHTML': '<span><b>' + id + ':</b> ' + record['points'] + ' ' + vk2.utils.getMsg('welcome-points') + '</span>'
		}));
	}
};

/**
 * Functions fetchs the data from server on load up
 * @param {Array.<Element>} georeferenceEls
 * @param {Array.<Element>} overallGeoreferenceEls
 * @param {Array.<Element>} relGeoreferenceEls
 * @param {Element} georeferenceUserRankingEl
 * @private
 */
vk2.app.WelcomePageApp.prototype.fetchData_ = function(georeferenceEls, overallGeoreferenceEls, 
		relGeoreferenceEls, georeferenceUserRankingEl) {
	var xhr = new goog.net.XhrIo();
	
	// add listener to request object
	goog.events.listenOnce(xhr, goog.net.EventType.SUCCESS, function(e){
		var xhr = /** @type {goog.net.XhrIo} */ (e.target),
		 	data = xhr.getResponseJson();
		
		if (goog.DEBUG) {
			console.log(data);
		};
		
		this.displayData_(data, georeferenceEls, overallGeoreferenceEls, 
				relGeoreferenceEls, georeferenceUserRankingEl);
		xhr.dispose();
	}, false, this);
	
	goog.events.listenOnce(xhr, goog.net.EventType.ERROR, function(e){
		alert('Something went wrong, while trying to fetch data from the server.')
	}, false, this);
	
	// send request
	var url = vk2.utils.routing.getGeoreferenceInformation();
	xhr.send(url, 'GET');	
};

/**
 * Replaces the innerHTML for a given list of elements
 * @param {Array.<Element>} elements
 * @param {string|number} innerHTML
 * @private
 */
vk2.app.WelcomePageApp.prototype.updateInnerHTML_ = function(elements, innerHTML) {
	for (var i = 0; i < elements.length; i++) {
		elements[i].innerHTML = innerHTML;
	};
};

/**
 * Updates the position styles for a given set of elements
 * @param {Array.<Element>} elements
 * @param {number} relValue
 * @private
 */
vk2.app.WelcomePageApp.prototype.updatePrograssbarStyle_ = function(elements, relValue) {
	for (var i = 0; i < elements.length; i++) {
		var width = goog.style.getStyle(elements[i], 'width'),
			marginLeft = goog.style.getStyle(elements[i], 'margin-left');
		
		// update width if set
		if (width !== undefined && width !== '') {
			goog.style.setStyle(elements[i], 'width', relValue + '%');
		};
		
		// update margin style
		if (marginLeft !== undefined && marginLeft !== '') {
			if (marginLeft.indexOf('-') > -1) {
				goog.style.setStyle(elements[i], 'margin-left', '-' + relValue + '%');
			} else {
				goog.style.setStyle(elements[i], 'margin-left', relValue + '%');
			}			
		};
	};
	
	// dirty hack
	$('head').append("<style>.vk2WelcomePageBody .vk2GeoreferenceProgressText .content:after{ left:" + relValue + "%; }</style>");
};