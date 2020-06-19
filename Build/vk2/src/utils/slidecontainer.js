goog.provide('vk2.utils.SlideContainer');

goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.style');

/**
 * Function encapsulate the slide out/in functionality.
 * @param {Element|string} parentEl
 * @param {string} className
 * @extends {goog.events.EventTarget}
 */
vk2.utils.SlideContainer = function(parentEl, className){
	
	/**
	 * @type {enum}
	 * @private
	 */
	this.glyp_ = {
		slideIn: 'glyphicon-menu-right',
		slideOut: 'glyphicon-menu-left'
	};
	
	/**
	 * @type {string}
	 * @private
	 */
	this.slideOrientation_ = 'left';
	
	/**
	 * @type {Element}
	 * @protected
	 */
	this.parentEl_ = goog.isString(parentEl) ? goog.dom.getElement(parentEl) : parentEl;
	
	/**
	 * @type {Element}
	 * @protected
	 */
	this.containerEl_ = goog.dom.createDom('div',{'class':className + ' slide-container'});
	goog.dom.appendChild(this.parentEl_, this.containerEl_);
	
	// append slide button
	var slideBtn_ = goog.dom.createDom('button', {
		'type':'button',
		'class':'btn btn-default',
		'aria-label':'Toggle menu',
		'innerHTML':'<span class="glyphicon" aria-hidden="true"></span>'
	});
	goog.dom.appendChild(this.containerEl_, slideBtn_);
	this.identifySlideOrientation_(slideBtn_);
	
	/**
	 * @type {Element}
	 * @protected
	 */
	this.childContainerEl_ = goog.dom.createDom('div');
	goog.dom.appendChild(this.containerEl_, this.childContainerEl_);
	
	/** 
	 * @type {number}
	 * @private
	 */
	this.slideDistance_ = goog.style.getSize(this.containerEl_).width; 
	
	// bind click behavior
	goog.events.listen(slideBtn_, 'click', function(event){
		var slideBtn_ = event.currentTarget;
		if (goog.dom.classes.has(slideBtn_, 'slide-out')){
			this.slideIn_(slideBtn_);
		} else {
			this.slideOut_(slideBtn_);
		};	
	}, undefined, this);
	
	// initialize start closed
	this.slideIn_(slideBtn_);
	
	goog.base(this);
};
goog.inherits(vk2.utils.SlideContainer, goog.events.EventTarget);

vk2.utils.SlideContainer.prototype.close = function(){
	var slideBtn = this.childContainerEl_.children[0];
	this.slideIn_(slideBtn);
};

/**
 * @return {Element}
 */
vk2.utils.SlideContainer.prototype.getContainerEl = function(){
	return this.childContainerEl_;
};

/**
 * The functions identifies, based on the margin values of the slide button,
 * if it should flow in from left or from right.
 * 
 * @param {Element} slideBtn
 * @private
 */
vk2.utils.SlideContainer.prototype.identifySlideOrientation_ = function(slideBtn) {
	var marginBox = goog.style.getMarginBox(slideBtn),
		orientation = marginBox.right === 0 && marginBox.left < 0 ? 'right' : 'left',
		spanEl = slideBtn.children[0];

	// if orientation is left than correct the glyps
	if (orientation === 'left'){
		this.glyp_ = {
			slideIn: 'glyphicon-menu-left',
			slideOut: 'glyphicon-menu-right'
		};
	};
	
	this.slideOrientation_ = orientation;
	
	
};

vk2.utils.SlideContainer.prototype.open = function(){
	var slideBtn = this.childContainerEl_.children[0];
	this.slideOut_(slideBtn);
};

/**
 * @param {Element} btnEl
 * @private
 */
vk2.utils.SlideContainer.prototype.slideIn_ = function(btnEl){
	var spanEl = btnEl.children[0],
		slideOutClassName = 'slide-out',
		slideInClassName = 'slide-in',
		marginOrientation = 'margin-' + this.slideOrientation_,
		animationProps = {};
	
	if (goog.dom.classes.has(btnEl, slideOutClassName)){
		goog.dom.classes.remove(btnEl, slideOutClassName);
	};
	goog.dom.classes.add(btnEl, slideInClassName);
	
	if (goog.dom.classes.has(spanEl, this.glyp_.slideIn)){
		goog.dom.classes.remove(spanEl, this.glyp_.slideIn);
	};
	goog.dom.classes.add(spanEl, this.glyp_.slideOut);
	
	animationProps[marginOrientation] = '-=' + this.slideDistance_;
	$(this.containerEl_).animate(animationProps, 400, function(){
		$(this).children('div').hide()
	});
};

/**
 * @param {Element} btnEl
 * @private
 */
vk2.utils.SlideContainer.prototype.slideOut_ = function(btnEl){
	var spanEl = btnEl.children[0],
		slideOutClassName = 'slide-out',
		slideInClassName = 'slide-in',
		marginOrientation = 'margin-' + this.slideOrientation_,
		animationProps = {};
	
	if (goog.dom.classes.has(btnEl, slideInClassName)){
		goog.dom.classes.remove(btnEl, slideInClassName);
	};
	goog.dom.classes.add(btnEl, slideOutClassName);
	
	if (goog.dom.classes.has(spanEl, this.glyp_.slideOut)){
		goog.dom.classes.remove(spanEl, this.glyp_.slideOut);
	};
	goog.dom.classes.add(spanEl, this.glyp_.slideIn);
	
	animationProps[marginOrientation] = '+=' + this.slideDistance_;
	$(this.containerEl_).children('div').show()
	$(this.containerEl_).animate(animationProps, 400);
};