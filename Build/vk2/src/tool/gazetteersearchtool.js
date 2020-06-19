/**
 * @fileoverview This object create a front end for a gazetteer service, so enable the user to search places
 * by there placenames. It also supports a blattnumber search.
 * @author Jacob.Mendt@slub-dresden.de (Jacob Mendt)
 * 
 * TODO - consider the type of the poi (city, country, ...) for the choosing of the zoom level at the select event
 */
goog.provide('vk2.tool.GazetteerSearch');
goog.provide('vk2.tool.GazetteerSearch.EventType');

goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.Event');
goog.require('goog.net.XhrIo');
goog.require('vk2.utils');

/**
 * Create a front end for a gazetteer service
 * @param {Element|string} parentEl
 * @param {string} searchUrl Expect a URL to a nominatim search services
 * @constructor 
 * @extends {goog.events.EventTarget}
 */
vk2.tool.GazetteerSearch = function(parentEl, searchUrl){

    /**
     * @type {string}
     * @private
     */
	this._searchUrl = searchUrl;

	/**
	 * @type {Element}
	 * @private
	 */
	this._parentElement = goog.isString(parentEl) ? goog.dom.getElement(parentEl) : parentEl;
	this._loadHtmlContent(this._parentElement);
	
	/**
	 * @type {Object}
	 * @private
	 */
	this._actualAutoCompleteData = {};
	
	/**
	 * @type {Object}
	 * @private
	 */
	this._submitHandler = {
		/**
		 * @param {string} placename
		 */
		'placename': goog.bind(function(placename){
			// get actual input field content
			if (this._actualAutoCompleteData.hasOwnProperty(placename)){
                this._createJumpToEvent(this._actualAutoCompleteData[placename][0]);
				return undefined;
			}; 
			
			this._requestPlacenameData(placename, goog.bind(function(data){
				if (data.length > 0){
					this._createJumpToEvent(data[0]);
				} else {
					alert('The choosen placename is unknown.');
				};
			}, this));
		}, this)
	};
	
	// append behavior
	this._appendAutoCompleteBehavior();
	this._appendSubmitBehavior();
	
	goog.base(this);
};
goog.inherits(vk2.tool.GazetteerSearch, goog.events.EventTarget);

/**
 * @param {Element} parentEl
 * @private
 */
vk2.tool.GazetteerSearch.prototype._loadHtmlContent = function(parentEl){
	
	var containerEl = goog.dom.createDom('div',{'class':'gazetteersearch-container'});
	goog.dom.appendChild(parentEl, containerEl);
	
	var formContainerEl = goog.dom.createDom('div',{'class':'form-group'});
	goog.dom.appendChild(containerEl, formContainerEl);
	
	/**
	 * @type {Element}
	 * @private
	 */
	this._inputText = goog.dom.createDom('input',{
		'placeholder': vk2.utils.getMsg('gazetteer-placeholder'),
		'type':'text',
		'class':'form-control gazetteersearch-input'
	});
	goog.dom.appendChild(formContainerEl, this._inputText);
	
	/**
	 * @type {Element}
	 * @private
	 */
	this._inputSubmit = goog.dom.createDom('input',{
		'value': vk2.utils.getMsg('gazetteer-submit'),
		'type':'submit',
		'class':'form-control gazetteersearch-submit'
	});
	goog.dom.appendChild(formContainerEl, this._inputSubmit);
};

/**
 * This appends jquery autocomplete behavior to the gazetteersearch 
 * @private
 */
vk2.tool.GazetteerSearch.prototype._appendAutoCompleteBehavior = function(){
	$(this._inputText).autocomplete({
    	'source': goog.bind(function( request, response ){
    		this._requestPlacenameData(request['term'], response);
    		return undefined;
    	}, this),
    	'delay': 300,
        'minLength': 3,
        'autoFocus': true,
    	'select': goog.bind(function( event, ui ){
    		this._createJumpToEvent(ui['item']);
    	}, this),
    	'open': function(){
    		$( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
    	},
    	'close': function(){
    		$( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
    	}
    });
};

/**
 * This appends submit behavior to the gazetteersearch 
 * @private
 */
vk2.tool.GazetteerSearch.prototype._appendSubmitBehavior = function(){
	/**
	 * @param {string} name
	 */
	var submitF = goog.bind(function(name){
		// if there are commas remove them together with the subsequently content
		var placename = name.indexOf(',') > -1 ? name.split(',')[0] : name;
		this._submitHandler['placename'](placename);
	}, this);
	//
	// append submit behavior to submit button
	goog.events.listen(this._inputSubmit, goog.events.EventType.CLICK, function(event){
		if (goog.DEBUG)
			console.log('Submit event through GazetteerSearch submit button.');

		submitF(this._inputText.value);
	}, undefined, this);
};

/**
 * @param {string} placename
 * @param {Function} callback
 * @private
 */
vk2.tool.GazetteerSearch.prototype._requestPlacenameData = function(placename, callback){
	// add loading
	goog.dom.classes.add(this._inputText, 'loading');
	
	var request_url = this._searchUrl + '?format=json&q='+placename;
	goog.net.XhrIo.send(request_url, goog.bind(function(e){
				var xhr = /** @type {goog.net.XhrIo} */ (e.target);
		    	var data = xhr.getResponseJson() ? xhr.getResponseJson() : xhr.getResponseText();
		    	xhr.dispose();

		    	console.log(data)
		    	// parse data
				var parsed_data = $.map(data, function(feature){
					return {
						'label': feature['display_name'],
						'value': feature['display_name'],
						'lonlat': {
							'x': parseFloat(feature['lon']),
							'y': parseFloat(feature['lat'])
						},
						'type': feature['type']
					};
				});
				// set this for other submit events
				this._actualAutoCompleteData[placename] = parsed_data;
				callback( parsed_data );
				
				// remove loading class
				if (goog.dom.classes.has(this._inputText,'loading'))
		    		goog.dom.classes.remove(this._inputText,'loading');
	}, this), "GET");
};

/**
 * @param {Object} feature
 * @param {string=} srs
 * @private
 */
vk2.tool.GazetteerSearch.prototype._createJumpToEvent = function(feature, srs){
	var epsg = goog.isDef(srs) ? srs : 'EPSG:4326';
	var jumpto_event = {
    	'location_type':feature.type,
    	'lonlat':[feature['lonlat']['x'],feature['lonlat']['y']],
    	'srs':epsg
    };
    this._dispatchJumpToEvent(jumpto_event);
};

/**
 * @param {Object} event_object
 * @private
 */
vk2.tool.GazetteerSearch.prototype._dispatchJumpToEvent = function(event_object){
	this.dispatchEvent(new goog.events.Event(vk2.tool.GazetteerSearch.EventType.JUMPTO,event_object));
};

/**
 * @enum {string}
 */
vk2.tool.GazetteerSearch.EventType = {
		JUMPTO: 'jumpto'
};