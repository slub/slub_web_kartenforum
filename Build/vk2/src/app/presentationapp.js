goog.provide('vk2.app.PresentationApp');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');

goog.require('vk2.utils');
goog.require('vk2.module.MapModule');
goog.require('vk2.tool.Permalink');
goog.require('vk2.module.SpatialTemporalSearchModule');
goog.require('vk2.module.LayerManagementModule');
goog.require('vk2.settings');

/**
 * @export
 * @constructor
 * @param {vk2x.app.PresentationAppOptions} settings
 */
vk2.app.PresentationApp = function(settings){

	if (goog.DEBUG)
		console.log(settings);

	// define proxy url
	vk2.utils.setProxyUrl();
	vk2.utils.checkIfCookiesAreEnabble();

	// check if the app should be started in georeference mode
	var isAuthenticate = goog.isDef(settings['authenticate']) && goog.isBoolean(settings['authenticate'])
			? settings['authenticate']
			: false,
		isPermalink = vk2.tool.Permalink.isPermalink();

	// append modal behavior to page anchors
	var modalAnchorClassName = goog.isDef(settings['modalAnchorClassName']) ? settings['modalAnchorClassName'] : 'vk2-modal-anchor';
	vk2.utils.loadModalOverlayBehavior(modalAnchorClassName);

	// check if there is a main page and if yes load it
	if (!isAuthenticate && !isPermalink)
		this.loadWelcomePage_();

	//
	// initialize basic application modules
	//
	var with25d = goog.isDef(settings['with25d']) ? settings['with25d'] : undefined,
		mapModule = new vk2.module.MapModule(settings['mapContainerId'], vk2.settings.MAPVIEW_PARAMS, with25d);

	// load spatialsearch
	var spatialSearch = new vk2.module.SpatialTemporalSearchModule(settings['spatialsearchContainerId'], mapModule.getMap());
	mapModule.registerSpatialTemporalSearch(spatialSearch);

	// load layermanagement
	var layermanagement = new vk2.module.LayerManagementModule(settings['mapContainerId'], mapModule.getMap().getLayers(), mapModule.getMap());

	// permalink
	var permalink = new vk2.tool.Permalink(mapModule.getMap());
	mapModule.registerPermalinkTool(permalink);

	if(goog.DEBUG){
		window['map'] = mapModule.getMap();
		window['module'] = mapModule;
	};

	// for correct displaying of tooltips
	setTimeout(function(){vk2.utils.overwriteOlTitles(settings['mapContainerId']);}, 500);
};

/**
 * @private
 */
vk2.app.PresentationApp.prototype.loadWelcomePage_ = function(){
	// welcome page
	var welcomePageOn = vk2.utils.getQueryParam('welcomepage');
	if (goog.dom.getElement("welcome-page-link") && vk2.utils.getCookie('vk2-welcomepage') !== 'off' && welcomePageOn !== 'off'){
		goog.dom.getElement("welcome-page-link").click();
	};
};