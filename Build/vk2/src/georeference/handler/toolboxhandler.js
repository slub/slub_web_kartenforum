goog.provide('vk2.georeference.handler.ToolboxHandler');

/**
 * @param {vk2.georeference.toolbox.Toolbox} toolbox
 * @constructor
 */
vk2.georeference.handler.ToolboxHandler = function(toolbox){
	
	/**
	 * @type {vk2.georeference.toolbox.Toolbox}
	 * @protected
	 */
	this.toolbox_ = toolbox;
};

/**
 * @return {vk2.georeference.handler.ToolboxHandler}
 */
vk2.georeference.handler.ToolboxHandler.prototype.getToolbox = function(){
	return this.toolbox_;
};