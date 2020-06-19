goog.provide('vk2.control.DynamicMapVisualization');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('vk2.tool.DynamicMapVisualization');
goog.require('vk2.utils');

/**
 * @param {Element} parentEl
 * @param {ol.Map} map
 * @constructor
 */
vk2.control.DynamicMapVisualization = function(parentEl, map){

	//
	// Create container DOM nodes
	//
	var containerEl_ = goog.dom.createDom('div', {'class':'dyn-vis-control','title': vk2.utils.getMsg('dynamicmapvis-open')}),
		contentEl_ = goog.dom.createDom('div', {
			'class':'content',
			'style':'display:none;'
	});
	goog.dom.appendChild(containerEl_, contentEl_);
	goog.dom.appendChild(parentEl, containerEl_);

	// create content container with control / feedback elements
	var feedbackEl_ = this.createFeedbackEl_(contentEl_);

	//
	// Create DynamicMapVisualization tool and couple it with control elements
	//
	var dynamicMapVis_ = new vk2.tool.DynamicMapVisualization(containerEl_, feedbackEl_);
	this.createContentEl_(contentEl_, dynamicMapVis_, map);
	this.createMenuEl_(containerEl_, contentEl_, dynamicMapVis_);
};

/**
 * @param {Element} parentEl
 * @param {Element} contentEl
 * @param {vk2.tool.DynamicMapVisualization} dynamicMapVis
 * @private
 */
vk2.control.DynamicMapVisualization.prototype.createMenuEl_ = function(parentEl, contentEl, dynamicMapVis){
	var controlEl = goog.dom.createDom('a', {'innerHTML':'o','class':'open-dyn-vis'});
	goog.dom.insertChildAt(parentEl, controlEl, 0);
	
	goog.events.listen(controlEl,'click', function(event){
		event.preventDefault();
		$(contentEl).slideToggle();
		
		if (goog.dom.classes.has(event.currentTarget, 'open')){
			dynamicMapVis.stopTimerseriesAnimation();
			goog.dom.classes.remove(event.currentTarget, 'open');
			event.currentTarget.parentElement['title'] = vk2.utils.getMsg('dynamicmapvis-open');
		} else {
			goog.dom.classes.add(event.currentTarget, 'open');
			event.currentTarget.parentElement['title'] = vk2.utils.getMsg('dynamicmapvis-close');
		};
	}, undefined, this);
};

/**
 * @param {Element} contentEl
 * @param {vk2.tool.DynamicMapVisualization} dynamicMapVis
 * @param {ol.Map} map
 * @private
 */
vk2.control.DynamicMapVisualization.prototype.createContentEl_ = function(contentEl, dynamicMapVis, map){
		
	var eventListeners = {
		start: function(event){
			event.preventDefault();
			var layers = map.getHistoricMapLayer();
			dynamicMapVis.startTimerseriesAnimation(layers, map);
		},
		stop: function(event){
			event.preventDefault();
			dynamicMapVis.stopTimerseriesAnimation();
		}
	};

	// create start button
	var startContainerEl = goog.dom.createDom('div', {'class':'start-container'});
	goog.dom.appendChild(contentEl, startContainerEl);
	
	var startAnchor = goog.dom.createDom('a', {
		'href':'#dynamic-start',
		'title':vk2.utils.getMsg('dynamicmapvis-start'),
		'innerHTML':'Start'
	});
	goog.dom.appendChild(startContainerEl, startAnchor);
	goog.events.listen(startAnchor, 'click', eventListeners.start, undefined, this);
	
	var tooltipStart = goog.dom.createDom('span', {'role':'tooltip','innerHTML':vk2.utils.getMsg('dynamicmapvis-start')});
	goog.dom.appendChild(startAnchor, tooltipStart);
	
	// create stop button
	var stopContainerEl = goog.dom.createDom('div', {'class':'stop-container'});
	goog.dom.appendChild(contentEl, stopContainerEl);
	
	var stopAnchor = goog.dom.createDom('a', {
		'href':'#dynamic-stop',
		'title':vk2.utils.getMsg('dynamicmapvis-stop'),
		'innerHTML':'Stop'
	});
	goog.dom.appendChild(stopContainerEl, stopAnchor);
	goog.events.listen(stopAnchor, 'click', eventListeners.stop, undefined, this);
	
	var tooltipStop = goog.dom.createDom('span', {'role':'tooltip','innerHTML':vk2.utils.getMsg('dynamicmapvis-stop')});
	goog.dom.appendChild(stopAnchor, tooltipStop);
};

/**
 * @param {Element} contentEl
 * @return {Element}
 * @private
 */
vk2.control.DynamicMapVisualization.prototype.createFeedbackEl_ = function(contentEl){
	var feedbackEl = goog.dom.createDom('div', {'class':'feedback'});
	goog.dom.appendChild(contentEl, feedbackEl);
	return feedbackEl;
};