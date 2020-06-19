goog.provide('vk2.georeference.view.SourceView');

goog.require('vk2.viewer.ZoomifyViewer');

/**
 * Encapsulating for future development.
 * 
 * @constructor
 * @extends {vk2.viewer.ZoomifyViewer}
 */
vk2.georeference.view.SourceView = function(){
		
	goog.base(this, arguments[0], arguments[1]);
};
goog.inherits(vk2.georeference.view.SourceView, vk2.viewer.ZoomifyViewer);