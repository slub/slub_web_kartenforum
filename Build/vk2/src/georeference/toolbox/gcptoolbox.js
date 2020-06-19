goog.provide('vk2.georeference.toolbox.GCPToolbox');
goog.provide('vk2.georeference.toolbox.GCPToolboxEventType');

goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');

goog.require('vk2.utils');
goog.require('vk2.georeference.toolbox.Toolbox')
/**
 * @enum {string}
 */
vk2.georeference.toolbox.GCPToolboxEventType = {
	ACTIVATE: 'activate',
	ACTIVATE_ADDGCP: 'activate-addgcp',
	ACTIVATE_DELGCP: 'activate-delgcp',
	ACTIVATE_DRAGGCP: 'activate-draggcp',
	ACTIVATE_NONE: 'activate-none',
	DEACTIVATE: 'deactivate',
	DEACTIVATE_ADDGCP: 'deactivate-addgcp',
	DEACTIVATE_DELGCP: 'deactivate-delgcp',
	DEACTIVATE_DRAGGCP: 'deactivate-draggcp',
	DEACTIVATE_NONE: 'deactivate-none'
};


/**
 * This class represent the gui control elements of the gcp toolbox
 * 
 * @param {string|Element} parentEl
 * @extends {vk2.georeference.toolbox.Toolbox}
 * @constructor
 */
vk2.georeference.toolbox.GCPToolbox = function(parentEl){
	
	if (goog.DEBUG)
		console.log('Setup Gcp Toolbox.');
	
	/**
	 * @type {Element}
	 * @private
	 */
	this.parentEl_ = goog.isString(parentEl) ? goog.dom.getElement(parentEl) : parentEl;

	
	// loads the toolbox
	var toolboxContainer = goog.dom.createDom('div',{
		'class':'georef-tools-gcp-container',
		'id':'georef-tools-gcp-container'
	});
	goog.dom.appendChild(this.parentEl_, toolboxContainer);	
	this.loadOpenCloseBehavior_(toolboxContainer);	
	this.loadGcpControls_(toolboxContainer);
	
	goog.base(this);
};
goog.inherits(vk2.georeference.toolbox.GCPToolbox, vk2.georeference.toolbox.Toolbox);

/**
 * Activates the GCPToolbox
 * @public
 */
vk2.georeference.toolbox.GCPToolbox.prototype.activate = function(){
	// check if it is already open
	var controlEl = goog.dom.getElement('georef-tools-gcp-handler');
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
vk2.georeference.toolbox.GCPToolbox.prototype.createGcpInteractionControlEl_ = function(elemId, elemValue, elemText){
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
 * Deactivates the GCPToolbox
 * @public
 */
vk2.georeference.toolbox.GCPToolbox.prototype.deactivate = function(){
	// check if it is already open
	var controlEl = goog.dom.getElement('georef-tools-gcp-handler');
	if (goog.isDefAndNotNull(controlEl) && !goog.dom.classes.has(controlEl, 'open'))
		return;
	
	
	$(controlEl).trigger('click');
	
	// in case of deactivation remove all active classes from the toggleControlEl
	var toogleElContainer = goog.dom.getElement('georef-tools-gcp-inner-container');
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
vk2.georeference.toolbox.GCPToolbox.prototype.dispatchToggleEvents_ = function(toggleType, toggleControlElements){
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
vk2.georeference.toolbox.GCPToolbox.prototype.loadGcpControls_ = function(toolboxContainer){
	
	var toolContainer = goog.dom.createDom('div',{
		'class': 'georef-tools-gcp-inner-container',
		'id': 'georef-tools-gcp-inner-container'
	});
	goog.dom.appendChild(toolboxContainer, toolContainer);
	
	// create tool list elements
	var toggleControlElements = [];
	// move map
	var moveMapControl = this.createGcpInteractionControlEl_('noneToggle', 'none', vk2.utils.getMsg('georef-movemap'));
	goog.dom.appendChild(toolContainer, moveMapControl);
	toggleControlElements.push(moveMapControl);

	// set point 	
	var addGcpControl = this.createGcpInteractionControlEl_('pointToggle', 'addgcp', vk2.utils.getMsg('georef-setgcp'));
	goog.dom.appendChild(toolContainer, addGcpControl);	
	toggleControlElements.push(addGcpControl);

	// drag point
	var dragGcpControl = this.createGcpInteractionControlEl_('dragToggle', 'draggcp', vk2.utils.getMsg('georef-movegcp'));
	goog.dom.appendChild(toolContainer, dragGcpControl);	
	toggleControlElements.push(dragGcpControl);

	// del point 
	var delGcpControl = this.createGcpInteractionControlEl_('deleteToggle', 'delgcp', vk2.utils.getMsg('georef-delgcp'));
	goog.dom.appendChild(toolContainer, delGcpControl);
	toggleControlElements.push(delGcpControl);
	
	// append behavior
	goog.events.listen(moveMapControl, 'click', goog.bind(this.dispatchToggleEvents_, this, 'none', toggleControlElements));
	goog.events.listen(addGcpControl, 'click', goog.bind(this.dispatchToggleEvents_, this, 'addgcp', toggleControlElements));
	goog.events.listen(dragGcpControl, 'click', goog.bind(this.dispatchToggleEvents_, this, 'draggcp', toggleControlElements));
	goog.events.listen(delGcpControl, 'click', goog.bind(this.dispatchToggleEvents_, this, 'delgcp', toggleControlElements));
};

/**
 * @param {Element} tbxContainer
 * @private
 */
vk2.georeference.toolbox.GCPToolbox.prototype.loadOpenCloseBehavior_ = function(tbxContainer){
	
	var controlEl = goog.dom.createDom('div',{
		'class': 'georef-tools-gcp-handler',
		'id': 'georef-tools-gcp-handler'
	});
	goog.dom.appendChild(tbxContainer, controlEl);
	goog.dom.appendChild(controlEl, goog.dom.createDom('span',{'class':'icon'}));
	
	// change toolsnav state by click
	$(controlEl).click(goog.bind(function() {
		// dispatch generic deactivate event
		if (goog.dom.classes.has(controlEl, 'open')){
			var genericEvent = new goog.events.Event(vk2.georeference.toolbox.GCPToolboxEventType.DEACTIVATE, controlEl);
			this.dispatchEvent(genericEvent);
		} else {
			var genericEvent = new goog.events.Event(vk2.georeference.toolbox.GCPToolboxEventType.ACTIVATE, controlEl);
			this.dispatchEvent(genericEvent);
		};
		
		
		$('#georef-tools-gcp-inner-container').slideToggle(300, function() {
			$(controlEl).toggleClass('open');
		});      
	}, this));
};

