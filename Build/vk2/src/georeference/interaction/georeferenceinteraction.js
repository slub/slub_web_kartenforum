goog.provide('vk2.georeference.interaction.GeoreferenceInteraction');

goog.require('goog.events.EventTarget');

/**
 * @interface
 * @constructor
 * @extends {goog.events.EventTarget}
 */
vk2.georeference.interaction.GeoreferenceInteraction = function(){
	
	/**
	 * @type {boolean}
	 * @protected
	 * @expose
	 */
	this.status_ = false;
	
	goog.base(this);
};
goog.inherits(vk2.georeference.interaction.GeoreferenceInteraction, goog.events.EventTarget);

/**
 * @public
 * @override
 */
vk2.georeference.interaction.GeoreferenceInteraction.prototype.activate = function(){};

/**
 * @public
 * @override
 */
vk2.georeference.interaction.GeoreferenceInteraction.prototype.deactivate = function(){};

/**
 * @public
 * @return {boolean}
 */
vk2.georeference.interaction.GeoreferenceInteraction.prototype.getActiveStatus = function() {
	return this.status_;
};
