goog.provide('vk2.utils.routing');

goog.require('goog.Uri');
goog.require('vk2.settings');

/**
 * Removes unnecessary "/" tokens on the path
 */
vk2.utils.routing.clearPath = function(string) {
	var elems = string.split('/');
	var str = "/";
	for (var i = 0; i < elems.length; i++) {
		if (elems[i] !== "")
			str += elems[i] + "/";
	};
	return str;
};

/**
 * @return {string}
 */
vk2.utils.routing.getBaseUrl = function() {
	var uri = new goog.Uri(window.location.href),
		languageParam = vk2.utils.getQueryParam("L"),
		language = languageParam !== undefined && languageParam !== "" ? languageParam : 0,
		path = uri.getPath()
	if (!vk2.settings.WITH_SPEAKING_URLS) {
		return path + '?' + vk2.settings.MAIN_PAGE + '&L=' + language;
	} else {
		if (path.indexOf(vk2.settings.MAIN_PAGE) === -1) {
			// there is no vkviewer in the heading set it
			var lang = path.indexOf('/de') !== -1 || path.indexOf('/en') !== -1 ? path.substring(0, 3) : '';
			return lang + vk2.settings.MAIN_PAGE + '?';
		};
		return path.substring(0, path.indexOf(vk2.settings.MAIN_PAGE) + vk2.settings.MAIN_PAGE.length) + '?';
	}
};

/**
 * Helper function for better concatenation of urls.
 * @return {string}
 */
vk2.utils.routing.getBaseUrlWithoutQuery = function() {
	var baseUrl = vk2.utils.routing.getBaseUrl(),
		indexQuestionMark = baseUrl.indexOf('?');
	return baseUrl.substring(0, indexQuestionMark);
};

/**
 * @param {string} key
 * @return {string}
 */
vk2.utils.routing.getGeoreferenceAdminProcessRoute = function(query_string) {
	var uri = new goog.Uri(window.location.href);
	if (!vk2.settings.WITH_SPEAKING_URLS)
		return vk2.utils.routing.getBaseUrl() + '&' + vk2.settings.EVALUATION_GETPROCESS + '&' + query_string;
	return vk2.utils.routing.getBaseUrlWithoutQuery() + vk2.settings.EVALUATION_GETPROCESS + '&' + query_string;
};

/**
 * @param {string} key
 * @return {string}
 */
vk2.utils.routing.getGeoreferenceAdminSetIsValideRoute = function(query_string) {
	var uri = new goog.Uri(window.location.href);
	if (!vk2.settings.WITH_SPEAKING_URLS)
		return vk2.utils.routing.getBaseUrl() + '&' + vk2.settings.EVALUATION_SETISVALIDE + '&' + query_string;
	return vk2.utils.routing.getBaseUrlWithoutQuery() + vk2.settings.EVALUATION_SETISVALIDE + '&' + query_string;
};

/**
 * @param {string} key
 * @return {string}
 */
vk2.utils.routing.getGeoreferenceAdminSetIsInValideRoute = function(query_string) {
	var uri = new goog.Uri(window.location.href);
	if (!vk2.settings.WITH_SPEAKING_URLS)
		return vk2.utils.routing.getBaseUrl() + '&' + vk2.settings.EVALUATION_SETISINVALIDE + '&' + query_string;
	return vk2.utils.routing.getBaseUrlWithoutQuery() + vk2.settings.EVALUATION_SETISINVALIDE + '&' + query_string;
};

/**
 * @return {string}
 */
vk2.utils.routing.getGeoreferenceUserHistory = function() {
	var uri = new goog.Uri(window.location.href);
	if (!vk2.settings.WITH_SPEAKING_URLS)
		return vk2.utils.routing.getBaseUrl() + '&' + vk2.settings.GEOREFERENCE_HISTORY;
	return vk2.utils.routing.getBaseUrlWithoutQuery() + vk2.settings.GEOREFERENCE_HISTORY;
};

/**
 * @return {string}
 */
vk2.utils.routing.getGeoreferenceInformation = function() {
	var uri = new goog.Uri(window.location.href);
	if (!vk2.settings.WITH_SPEAKING_URLS)
		return vk2.utils.routing.getBaseUrl() + '&' + vk2.settings.GEOREFERENCE_INFORMATION;
	return vk2.utils.routing.getBaseUrlWithoutQuery() + vk2.settings.GEOREFERENCE_INFORMATION;
};

/**
 * @param {string} query_string
 * @return {string}
 */
vk2.utils.routing.getGeorefGetProcessRoute = function(query_string) {
	var uri = new goog.Uri(window.location.href);
	if (!vk2.settings.WITH_SPEAKING_URLS)
		return vk2.utils.routing.getBaseUrl() + '&' + vk2.settings.GEOREFERENCE_GETPROCESS + '&' + query_string;
	return vk2.utils.routing.getBaseUrlWithoutQuery() + vk2.settings.GEOREFERENCE_GETPROCESS + '&' + query_string;
};

/**
 * @param {string} query_string
 * @return {string}
 */
vk2.utils.routing.getGeorefValidationRoute = function(query_string) {
	var uri = new goog.Uri(window.location.href);
	if (!vk2.settings.WITH_SPEAKING_URLS)
		return vk2.utils.routing.getBaseUrl() + '&' + vk2.settings.GEOREFERENCE_VALIDATION + '&' + query_string;
	return vk2.utils.routing.getBaseUrlWithoutQuery() + vk2.settings.GEOREFERENCE_VALIDATION + '&' + query_string;
};

/**
 * @param {string} query_string
 * @return {string}
 */
vk2.utils.routing.getGeorefConfirmationRoute = function(query_string) {
	var uri = new goog.Uri(window.location.href);
	if (!vk2.settings.WITH_SPEAKING_URLS)
		return vk2.utils.routing.getBaseUrl() + '&' + vk2.settings.GEOREFERENCE_CONFIRM + '&' + query_string;
	return vk2.utils.routing.getBaseUrlWithoutQuery() + vk2.settings.GEOREFERENCE_CONFIRM + '&' + query_string;
};

/**
 * @param {string|undefined} opt_objectid
 * @param {string|undefined} opt_params
 * @return {string}
 */
vk2.utils.routing.getGeorefPageRoute = function(opt_objectid, opt_params) {
	var params = opt_objectid !== undefined ? '&objectid=' + opt_objectid : 
			opt_params !== undefined ? '&' + opt_params :  '';
	var uri = new goog.Uri(window.location.href);
	if (!vk2.settings.WITH_SPEAKING_URLS)
		return vk2.utils.routing.getBaseUrl() + '&' + vk2.settings.GEOREFERENCE_PAGE + params;
	return vk2.utils.routing.getBaseUrlWithoutQuery() + vk2.settings.GEOREFERENCE_PAGE + '&' + params;
};

/**
 * @param {string} key
 * @return {string}
 */
vk2.utils.routing.getMapProfileRoute = function(key) {
	var uri = new goog.Uri(window.location.href);
	if (!vk2.settings.WITH_SPEAKING_URLS)
		return vk2.utils.routing.getBaseUrl() + '&' + vk2.settings.MAPPROFILE_PAGE + '&objectid=' + key;
	return vk2.utils.routing.getBaseUrlWithoutQuery() + vk2.settings.MAPPROFILE_PAGE + '&objectid=' + key;
};

/**
 * @param {string} key
 * @return {string}
 */
vk2.utils.routing.getMainPageRoute = function(key) {
	return vk2.utils.routing.getBaseUrl();
};



