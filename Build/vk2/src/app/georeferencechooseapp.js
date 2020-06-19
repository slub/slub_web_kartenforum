goog.provide('vk2.app.GeoreferenceChooseApp');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.net.EventType');
goog.require('goog.net.XhrIo');
goog.require('vk2.request.ElasticSearch');
goog.require('vk2.settings');
goog.require('vk2.utils');
goog.require('vk2.utils.routing');

/**
 * @export
 * @param {Object} settings
 * 		target {string} Id of the record container
 * 		targetCount {string} Id of the point container
 * @constructor
 */
vk2.app.GeoreferenceChooseApp = function(settings) {
	
	if (goog.DEBUG) {
		console.log(settings)
	};

	/**
	 * Unreferenced georeference records.
	 * @type {Array.<Object>}
	 * @private
     */
	this.searchRecords_ = [];
	
	var targetEl = goog.dom.getElement(settings['target']),
		targetCountEl = goog.dom.getElement(settings['targetCount']);
	
	this.fetchData_(targetEl, targetCountEl);
};

/**
 * Functions adds clientside search behavior to the georeference records.
 *
 * @param {Element} targetEl
 * @private
 */
vk2.app.GeoreferenceChooseApp.prototype.addRecordSearchBehavior_ = function(targetEl) {

	// clear target element and append listContainerEl
	targetEl.innerHTML = '';

	var parentEl = goog.dom.createDom('div', { 'class':'form-group'}),
		inputEl = goog.dom.createDom('input', {'type': 'text', 'id':'georeference-search', 'name':'georeference-search',
			'class':'form-control', 'placeholder': vk2.utils.getMsg('georef-search-field') + ':'}),
		listContainerEl = goog.dom.createDom('ul');

	goog.dom.appendChild(parentEl, inputEl);
	goog.dom.appendChild(targetEl, parentEl);
	goog.dom.appendChild(targetEl, listContainerEl);

	var updateSearchListFn_ = goog.bind(function(searchRecords) {
			// clear list
			listContainerEl.innerHTML = '';

			// render map records
			for (var i = 0, ii = searchRecords.length; i < ii; i++) {
				goog.dom.appendChild(listContainerEl,
					this.renderRecord_(searchRecords[i]));
			};

			// for trigger lazyloading behavior in case list is not long enough
			setTimeout(function() {$('body').scroll();}, 100);
		}, this),
		timeout = 1000,
		updateWithTimeout_;

	// Function for registering change on the search field
	goog.events.listen(inputEl, goog.events.EventType.KEYDOWN, function(event){
		// remove old timeout
		clearTimeout(updateWithTimeout_);

		// trigger new update event with timeout
		updateWithTimeout_ = setTimeout(goog.bind(function() {
			// get sort string
			var searchString = event['target']['value'],
				searchRecords = this.getSortRecords_(searchString);

			updateSearchListFn_(searchRecords);
		}, this), timeout);
	}, undefined, this);

	// initial trigger update function
	updateSearchListFn_(this.searchRecords_);
};

/**
 * @param {Object} data
 * @param {Element} targetEl
 * @param {Element} targetCountEl
 * @private
 */
vk2.app.GeoreferenceChooseApp.prototype.displayData_ = function(data, targetEl, targetCountEl) {
	
	// update point data
	if (data['hits'] !== undefined && data['hits']['total'] !== undefined) {
		targetCountEl.innerHTML = data['hits']['total'];
	};
		
	if (data['hits'] !== undefined && data['hits']['hits'] !== undefined && data['hits']['hits'].length > 0) {

		this.searchRecords_ = data['hits']['hits'];

		// append search field
		this.addRecordSearchBehavior_(targetEl);

	}
	
	// in case jquery lazy loading is active
	$('body').scroll(function() {
		$('.lazy-image').lazyload();
	});
	$('.lazy-image').lazyload();
};

/** 
 * Functions fetchs the data from server on load up
 * @param {Element} targetEl
 * @param {Element} targetCountEl
 * @private
 */
vk2.app.GeoreferenceChooseApp.prototype.fetchData_ = function(targetEl, targetCountEl) {
	var xhr = new goog.net.XhrIo();
	
	// add listener to request object
	goog.events.listenOnce(xhr, goog.net.EventType.SUCCESS, function(e){
		var xhr = /** @type {goog.net.XhrIo} */ (e.target),
		 	data = xhr.getResponseJson();
		
		if (goog.DEBUG) {
			console.log(data);
		};
		
		this.displayData_(data, targetEl, targetCountEl);
		xhr.dispose();
	}, false, this);
	
	goog.events.listenOnce(xhr, goog.net.EventType.ERROR, function(e){
		alert('Something went wrong, while trying to fetch data from the server.')
	}, false, this);
	
	// send request
	var url = vk2.settings.ELASTICSEARCH_NODE + '/_search?size=2000',
		payload = vk2.request.ElasticSearch.getFeaturesForIdsFilterQuery('georeference', [false]);
	// append sorting
	payload['sort'] = {'title': {'order':'asc'}};
	
	xhr.send(url, 'POST', JSON.stringify(payload));	
};

/**
 * Takes the matchString and returns all search records where the title matches the string;
 * @param {string} matchString
 * @returns {Array.<Object>}
 * @private
 */
vk2.app.GeoreferenceChooseApp.prototype.getSortRecords_ = function(matchString) {
	var records = $.extend(true, [], this.searchRecords_),
		sortedRecords = [];

	for (var i = records.length - 1; i >= 0; i--) {
		if (records[i]['_source']['title'].indexOf(matchString, 0) === 0) {
			sortedRecords.push(records[i]);
		}
	}
	return sortedRecords;
};

/**
 * Function creates a map record element for a given map record 
 * @param {Object} record
 * @return {Element}
 */
vk2.app.GeoreferenceChooseApp.prototype.renderRecord_ = function(record) {
	var data = record['_source'],
		id = record['_id'],
		maptype = data['maptype'],
		imageUrl = data['thumb'] !== undefined ? data['thumb'] : '#',
		georefUrl = id !== undefined ? vk2.utils.routing.getGeorefPageRoute(id) : '#',
		title = data['title'],
		time = data['time'];
	
	return goog.dom.createDom('li', {
		'id': data['id'],
		'innerHTML': '<div class="container record-container"><div class="image">' +
			'<img class="lazy-image" alt="" data-original="' + imageUrl + '"></div><div class="body">' + 
			'<p><strong>' + title + '</strong></p>' +
			'<p>' + vk2.utils.getMsg('georef-choose-time') + ': ' + time + '</p>' +
			'<p>' + vk2.utils.getMsg('georef-choose-maptype') + ': ' + maptype + '</p>' +
			'</div><div class="tools"><a class="btn btn-primary" href="' + georefUrl + '" target="_top">' +
			vk2.utils.getMsg('georef-choose-goToGeoreference') +'</a></div></div>'
	});
};