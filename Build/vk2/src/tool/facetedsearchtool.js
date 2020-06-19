goog.provide('vk2.tool.FacetedSearch');
goog.provide('vk2.tool.FacetedSearchTypes');
goog.provide('vk2.tool.FacetedSearchEventType');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');

/**
 * @enum
 */
vk2.tool.FacetedSearchTypes = {
	'AE': 'maptype-ae',
	'AK': 'maptype-ak',
	'CM': 'maptype-cm',
	'GL': 'maptype-gl',
	'MB': 'maptype-mb',
	'MTB': 'maptype-mtb',
	'TK': 'maptype-tk',
	'TKX': 'maptype-tkx',
	'ToGeoref': 'georeference-false'
};

/**
 * @enum
 */
vk2.tool.FacetedSearchEventType = {
	FACET_CHANGE: 'facet-change'
};
		
/**
 * @param {Element|string} parentEl
 * @param {boolean} georeferenceMode
 * @constructor 
 * @extends {goog.events.EventTarget}
 */
vk2.tool.FacetedSearch = function(parentEl, georeferenceMode){
	
	/**
	 * @type {Element}
	 * @private
	 */
	this.parentEl_ = goog.isString(parentEl) ? goog.dom.getElement(parentEl) : parentEl;
	
	// if georeferenceMode is not active remove the ToGeoref facet
	if (!georeferenceMode){
		delete vk2.tool.FacetedSearchTypes['ToGeoref'];
	};
	
	// append html
	var innerHTML = '';
	for (var key in vk2.tool.FacetedSearchTypes) {
		var title = vk2.utils.getMsg('facet-' + key.toLowerCase());
		innerHTML += '<label class="checkbox-inline" title="' + title + '"><input class="facet-search-el" type="checkbox" id="' + key +
			'" value="' + vk2.tool.FacetedSearchTypes[key] + '" title="' + title +
			'" >' + title + '</label>';
	};
	
	var facetEl_ = goog.dom.createDom('div', {
		'class':'search-facet',
		'innerHTML': innerHTML
	});
	
	goog.dom.appendChild(this.parentEl_, facetEl_);
	
	// append behavior
	goog.events.listen(facetEl_, 'click', function(event) {
		// get all checked values
		var elements = goog.dom.getElementsByClass('facet-search-el', event.currentTarget),
			checkedEl = [],
			georeference = true;
		
		for (var i = 0; i < elements.length; i++) {
			if (elements[i].checked){
				var key = elements[i].value.split("-")[0],
					value = elements[i].value.split("-")[1];

				if (key !== 'georeference')
					checkedEl.push({'key':key, 'value':value});
				
				if (key === 'georeference')
					georeference = false;
			};
		};
		
		// publish event with a list of active elements
		this.dispatchEvent(new goog.events.Event(vk2.tool.FacetedSearchEventType.FACET_CHANGE,{
			'facets': checkedEl,
			'georeference': georeference
		}));
	}, undefined, this);
	
	goog.base(this);
};
goog.inherits(vk2.tool.FacetedSearch, goog.events.EventTarget);