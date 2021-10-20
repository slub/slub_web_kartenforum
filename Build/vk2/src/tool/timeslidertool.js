goog.provide('vk2.tool.TimeSlider');
goog.provide('vk2.tool.TimeSliderEventType');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');

/**
 * @enum {string}
 */
vk2.tool.TimeSliderEventType = {
	TIMECHANGE: 'timechange'
};

/**
 * @param {Element|string} parentEl
 * @param {Array.<number>|undefined} opt_timeInterval
 * @constructor
 * @extends {goog.events.EventTarget}
 */
vk2.tool.TimeSlider = function(parentEl, opt_timeInterval){

	var containerEl_ = goog.isString(parentEl) ? goog.dom.getElement(parentEl) : parentEl;

	/**
	 * @type {Element}
	 * @private
	 */
	this.parentEl_ = goog.dom.createDom('div',{'class':'timeslider-container'});
	goog.dom.appendChild(containerEl_, this.parentEl_);


	var timeInterval = opt_timeInterval !== undefined ? opt_timeInterval : undefined;
	if (opt_timeInterval !== undefined) {
		this.setTimeInterval(opt_timeInterval);
	};

	goog.base(this);
};
goog.inherits(vk2.tool.TimeSlider, goog.events.EventTarget);

/**
 * @param {Element} parentEl
 * @return {Element} sliderEl
 * @private
 */
vk2.tool.TimeSlider.prototype.loadHtmlContent_ = function(parentEl){
	// deletes old html content
	parentEl.innerHTML = '';

	//
	// load new html content
	//
	var labelEl = goog.dom.createDom('label',{'innerHTML':vk2.utils.getMsg('timeslider-adjust-timeperiod')});
	goog.dom.appendChild(parentEl, labelEl);

	var  sliderContainer = goog.dom.createDom('div', {'class':'slider-container'});
	goog.dom.appendChild(parentEl, sliderContainer);

	var sliderEl_ = goog.dom.createDom('div',{'class':'slider'});
	goog.dom.appendChild(sliderContainer, sliderEl_);

	return sliderEl_;
};

/**
 * Set a new timeinterval for the timeslider module
 * @param {Array.<number>} timeInterval
 */
vk2.tool.TimeSlider.prototype.setTimeInterval = function(timeInterval) {
	var sliderEl_ = this.loadHtmlContent_(this.parentEl_),
		minValueEl,
		maxValueEl;

	/**
	 * 	@param {number} value
	 *	@param {Element} element
	 */


	// append tooltips
	minValueEl = goog.dom.createDom('div',{
		'class':'tooltip min-value',
		'innerHTML':timeInterval[0]
	});
	goog.dom.appendChild(sliderEl_, minValueEl);

	maxValueEl = goog.dom.createDom('div',{
		'class':'tooltip max-value',
		'innerHTML':timeInterval[1]
	});
	goog.dom.appendChild(sliderEl_, maxValueEl);
};


