goog.provide('vk2.georeference.toolbox.ClipToolbox');
goog.provide('vk2.georeference.toolbox.ClipToolboxEventType');

goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');

goog.require('vk2.utils');
goog.require('vk2.georeference.toolbox.Toolbox');

/**
 * @enum {string}
 */
vk2.georeference.toolbox.ClipToolboxEventType = {
	ACTIVATE: 'activate',
	DEACTIVATE: 'deactivate',
	ACTIVATE_DRAWCLIP: 'activate-drawclip',
	ACTIVATE_NONE: 'activate-none',
	DEACTIVATE_NONE: 'deactivate-none',
	DEACTIVATE_DRAWCLIP: 'deactivate-drawclip'
};


/**
 * @param {string|Element} parentEl
 * @param {vk2.georeference.handler.ClipToolboxHandler} handler
 * @extends {vk2.georeference.toolbox.Toolbox}
 * @constructor
 */
vk2.georeference.toolbox.ClipToolbox = function(parentEl){
	
	if (goog.DEBUG){
		console.log('Setup Clip Toolbox.');
	};	
	
	/**
	 * @type {Element}
	 * @private
	 */
	this._parentEl = goog.isString(parentEl) ? goog.dom.getElement(parentEl) : parentEl;
	
	// loads the toolbox
	var toolboxContainer = goog.dom.createDom('div',{
		'class':'georef-tools-clip-container',
		'id':'georef-tools-clip-container'
	});
	goog.dom.appendChild(this._parentEl, toolboxContainer);	
	this.loadOpenCloseBehavior_(toolboxContainer);	
	this.loadGcpControls_(toolboxContainer);
	
	goog.base(this);
};
goog.inherits(vk2.georeference.toolbox.ClipToolbox, vk2.georeference.toolbox.Toolbox);

/**
 * Activates the GcpToolbox
 * @public
 */
vk2.georeference.toolbox.ClipToolbox.prototype.activate = function(){
	// check if it is already open
	var controlEl = goog.dom.getElement('georef-tools-clip-handler');
	if (goog.isDefAndNotNull(controlEl) && goog.dom.classes.has(controlEl, 'open'))
		return;

	$(controlEl).trigger('click');
};

/**
 * @param {string} elemId
 * @param {string} elemValue
 * @param {string} elemText
 * @return {Element}
 * @private
 */
vk2.georeference.toolbox.ClipToolbox.prototype.createClipInteractionControlEl_ = function(elemId, elemValue, elemText){
	var divEl = goog.dom.createDom('div',{'class':'tool'});
	var toggleControl = goog.dom.createDom('div',{
		'id':elemId,
		'class':'tool-move toggle-elements ' + elemId,
		'value':elemValue,
		'innerHTML':'<span class="tool-title">' + elemText + '</span>'
	});
	goog.dom.appendChild(divEl, toggleControl);
	return divEl;
};

/**
 * Deactivates the GcpToolbox
 * @public
 */
vk2.georeference.toolbox.ClipToolbox.prototype.deactivate = function(){
	// check if it is already open
	var controlEl = goog.dom.getElement('georef-tools-clip-handler');
	if (goog.isDefAndNotNull(controlEl) && !goog.dom.classes.has(controlEl, 'open'))
		return;
	
	
	$(controlEl).trigger('click');
	
	// in case of deactivation remove all active classes from the toggleControlEl
	var toogleElContainer = goog.dom.getElement('georef-tools-clip-inner-container');
	var toggleEls = goog.dom.getElementsByClass('toggle-elements');
	for (var i = 0; i < toggleEls.length; i++){
		if (goog.dom.classes.has(toggleEls[i], 'active'))
			goog.dom.classes.remove(toggleEls[i], 'active');
	};
};

/**
 * @param {string} toggleType
 * @param {Array.<Element>} toggleControlElements
 * @private
 */
vk2.georeference.toolbox.ClipToolbox.prototype.dispatchToggleEvents_ = function(toggleType, toggleControlElements){
	if (goog.DEBUG) {
		console.log('Dispatch toggle events.');
	};

	/**
	 * @param {Element} eventEl
	 * @param {string} toggleType
	 */
	var activate = goog.bind(function(eventEl, eventType){
		if (!goog.dom.classes.has(eventEl, 'active'))
			goog.dom.classes.add(eventEl, 'active');
		
		// dispatch specific activate event
		var event = new goog.events.Event('activate-'+eventType, eventEl);
		this.dispatchEvent(event);		
	}, this);
	
	/**
	 * @param {Element} eventEl
	 * @param {string} toggleType
	 */
	var deactivate = goog.bind(function(eventEl, eventType){
		if (goog.dom.classes.has(eventEl, 'active'))
			goog.dom.classes.remove(eventEl, 'active');
		
		var event = new goog.events.Event('deactivate-'+eventType, eventEl);
		this.dispatchEvent(event);
	
	}, this);
	
	for (var i = 0; i < toggleControlElements.length; i++){
		var toggleElement = toggleControlElements[i].children[0];
		
		if (toggleElement.value === toggleType){
			activate(toggleElement, toggleElement.value);
		} else {
			deactivate(toggleElement, toggleElement.value);
		}
	};
};

/**
 * @param {Element} toolboxContainer
 * @private
 */
vk2.georeference.toolbox.ClipToolbox.prototype.loadGcpControls_ = function(toolboxContainer){
	
	var toolContainer = goog.dom.createDom('div',{
		'class': 'georef-tools-clip-inner-container',
		'id': 'georef-tools-clip-inner-container'
	});
	goog.dom.appendChild(toolboxContainer, toolContainer);
	
	// create tool list elements
	var toggleControlElements = [];
	// move map
	var moveMapControl = this.createClipInteractionControlEl_('noneToggle', 'none', vk2.utils.getMsg('georef-movemap'));
	goog.dom.appendChild(toolContainer, moveMapControl);
	toggleControlElements.push(moveMapControl);

	// draw clip polygon	
	var drawClipPolygon = this.createClipInteractionControlEl_('drawClip', 'drawclip', vk2.utils.getMsg('georef-drawclip'));
	goog.dom.appendChild(toolContainer, drawClipPolygon);	
	toggleControlElements.push(drawClipPolygon);


	// append behavior
	goog.events.listen(moveMapControl, 'click', goog.bind(this.dispatchToggleEvents_, this, 'none', toggleControlElements));
	goog.events.listen(drawClipPolygon, 'click', goog.bind(this.dispatchToggleEvents_, this, 'drawclip', toggleControlElements));
};

/**
 * @param {Element} tbxContainer
 * @private
 */
vk2.georeference.toolbox.ClipToolbox.prototype.loadOpenCloseBehavior_ = function(tbxContainer){
	
	var controlEl = goog.dom.createDom('div',{
		'class': 'georef-tools-clip-handler',
		'id': 'georef-tools-clip-handler'
	});
	goog.dom.appendChild(tbxContainer, controlEl);
	goog.dom.appendChild(controlEl, goog.dom.createDom('span',{'class':'icon'}));
	
	// change toolsnav state by click
	$(controlEl).click(goog.bind(function() {
		// dispatch generic deactivate event
		if (goog.dom.classes.has(controlEl, 'open')){
			var genericEvent = new goog.events.Event(vk2.georeference.toolbox.ClipToolboxEventType.DEACTIVATE, controlEl);
			this.dispatchEvent(genericEvent);
		} else {
			var genericEvent = new goog.events.Event(vk2.georeference.toolbox.ClipToolboxEventType.ACTIVATE, controlEl);
			this.dispatchEvent(genericEvent);
		};

		$('#georef-tools-clip-inner-container').slideToggle(300, function() {
			$(controlEl).toggleClass('open');
		});      
	}, this));
};

