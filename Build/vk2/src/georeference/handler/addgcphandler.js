goog.provide('vk2.georeference.handler.AddGCPHandler');

/**
 * @constructor
 */
vk2.georeference.handler.AddGCPHandler = function(){
	
	/**
	 * @type {boolean}
	 * @private
	 */
	this.srcBlocked_ = false;
	
	/**
	 * @type {boolean}
	 * @private
	 */
	this.targetBlocked_ = false;
	
	/**
	 * @type {number}
	 * @private
	 */
	this.processId_ = 0;
};

/**
 * Checks if the process is finished
 * @return {boolean}
 */
vk2.georeference.handler.AddGCPHandler.prototype.isFinished = function(){
	return this.srcBlocked_ && this.targetBlocked_;
};

/** 
* This function checks if there is already a running process
* @return {boolean}
*/
vk2.georeference.handler.AddGCPHandler.prototype.isRunningAddingProcess = function(){
	return this.srcBlocked_ || this.targetBlocked_; 
};

/**
* Gets the running process id or generates a new on
* @return {string}
*/
vk2.georeference.handler.AddGCPHandler.prototype.getRunningProcessId = function(){
	if (!this.isRunningAddingProcess())
		this.processId_ += 1;
	return '' + this.processId_;			
};

/**
 * @return {boolean}
 */
vk2.georeference.handler.AddGCPHandler.prototype.getSrcBlocked = function(){
	return this.srcBlocked_;
};

/**
 * @return {boolean}
 */
vk2.georeference.handler.AddGCPHandler.prototype.getTargetBlocked = function(){
	return this.targetBlocked_;
};

/**
 * @param {boolean} isBlocked
 */
vk2.georeference.handler.AddGCPHandler.prototype.setSrcBlocked = function(isBlocked){
	this.srcBlocked_ = isBlocked;
};

/**
 * @param {boolean} isBlocked
 */
vk2.georeference.handler.AddGCPHandler.prototype.setTargetBlocked = function(isBlocked){
	this.targetBlocked_ = isBlocked;
};