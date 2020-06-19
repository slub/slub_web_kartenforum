goog.provide('vk2.module.LayerManagementModule');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
//goog.require('ol.Collection');
goog.require('vk2.factory.LayerManagementFactory');
goog.require('vk2.control.DeactivateMapCollection');
goog.require('vk2.control.DynamicMapVisualization');

/**
 * @param {Element|string} parentEl
 * @param {ol.Collection} layers
 * @param {ol.Map} map
 * @constructor
 * @extends {goog.events.EventTarget}
 */
vk2.module.LayerManagementModule = function(parentEl, layers, map){

	/**
	 * @type {ol.Collection}
	 * @private
	 */
	this.layers_ = layers;
	
	/**
	 * @type {ol.Map}
	 * @private
	 */
	this.map_ = map;

	//
	// Create DOM nodes
	//
	var parentEl_ = goog.isString(parentEl) ? goog.dom.getElement(parentEl) : parentEl,
		containerEl_ = this.createContainerEl_(parentEl_),
		headerEl_ = this.createHeaderEl_(containerEl_),
		bodyEl_ = this.createBodyEl_(containerEl_);

	/**
	 * Set bodyEl_ as instance property for using in events.
	 * @type {Element}
	 * @private
	 */
	this.bodyEl_ = bodyEl_;

	//
	// append controls to headerEl
	//
	var deactiveMapColControl_ = new vk2.control.DeactivateMapCollection(headerEl_, this.map_),
		dynamicMapVisControl_ = new vk2.control.DynamicMapVisualization(headerEl_, this.map_);

	// listeners for registering new or removed layers
	this.activate_();
	
	goog.base(this);
};
goog.inherits(vk2.module.LayerManagementModule, goog.events.EventTarget);

/**
 * @param {Element} parentEl
 * @return {Element}
 * @private
 */
vk2.module.LayerManagementModule.prototype.createBodyEl_ = function(parentEl) {
	var bodyEl_ = goog.dom.createDom('ul',{
		'class':'layermanagement-body',
		'innerHTML':'<li class="empty">' + vk2.utils.getMsg('layermanagement-start-msg') + '</li>'});
	goog.dom.appendChild(parentEl, bodyEl_);
	return bodyEl_;
};

/**
 * @param {Element} parentEl
 * @return {Element}
 * @private
 */
vk2.module.LayerManagementModule.prototype.createContainerEl_ = function(parentEl) {
	var containerEl = goog.dom.createDom('div',{'class':'layermanagement-container', 'id':'layermanagement-container'});
	goog.dom.appendChild(parentEl, containerEl);
	return containerEl;
};

/**
 * @param {Element} parentEl
 * @return {Element}
 * @private
 */
vk2.module.LayerManagementModule.prototype.createHeaderEl_ = function(parentEl) {
	var headerEl_ = goog.dom.createDom('div', {'class':'heading'});
	goog.dom.appendChild(parentEl, headerEl_);

	var label_ = goog.dom.createDom('span', {
		'class':'header-label',
		'innerHTML': vk2.utils.getMsg('layermanagement-header-lbl')
	});
	goog.dom.appendChild(headerEl_, label_);
	return headerEl_;
};

/**
 * This methods returns an array of layer which have should be display in the layerswitcher
 * @return {Array.<ol.layer.Base>}
 * @private
 */
vk2.module.LayerManagementModule.prototype.getLayers_ = function(){
	var allLayers = this.layers_.getArray();
	var layers = [];
	for (var i = 0, ii = allLayers.length; i < ii; i++){
		if (goog.isDef(allLayers[i].allowUseInLayerManagement)	&& allLayers[i].allowUseInLayerManagement){
			layers.push(allLayers[i])
		};
	};
	return layers;
};

/**
 * @param {ol.layer.Base} layer
 * @return {number}
 * @private
 */
vk2.module.LayerManagementModule.prototype.getIndexToLayer_ = function(layer){
	var layers = this.layers_.getArray();
	for (var i = 0, ii = layers.length; i < ii; i++){
		if (layer === layers[i]){
			return i
		};
	};
};

/**
 * @param {ol.CollectionEvent} event
 * @private
 */
vk2.module.LayerManagementModule.prototype.refresh_ = function(event){
	if (goog.isDef(event.element.allowUseInLayerManagement)
			&& event.element.allowUseInLayerManagement){
		// clear list
		this.bodyEl_.innerHTML = '';

		var layers = this.getLayers_();
		for (var i = layers.length-1, ii = 0; i >= ii; i--){
			var layermanagementrecord = vk2.factory.LayerManagementFactory.getLayerManagementRecord(layers[i], i, this.map_);
			goog.dom.appendChild(this.bodyEl_, layermanagementrecord);
		};
	};
	
	// activates the sortable
	$(this.bodyEl_).sortable({
		'revert': true,
		'handle': '.drag-btn',
		'stop': goog.bind(function(event, ui){
			var layers = this.getLayers_();
			var listElements = goog.dom.getElementsByClass('layermanagement-record', this.bodyEl_);
			var oldListIndex = listElements.length - parseInt(listElements[ui.item.index()].id, 0) - 1;
			var newListIndex = ui.item.index();
			var newLayerIndex = (layers.length - 1) - newListIndex;
			var oldLayerIndex = parseInt(listElements[newListIndex].id, 0);
			
			if (goog.DEBUG){
				console.log('Sort event stop!');
				console.log('OldListId: '+oldListIndex);
				console.log('NewListId: '+newListIndex);
				console.log(layers);
				console.log('OldLayerId: '+oldLayerIndex);
				console.log('NewLayerId: '+newLayerIndex);
			};
		
			// prevent from removing/adding the layer if it was drag on the same place
			if (goog.isDef(oldLayerIndex) && (oldListIndex != newListIndex)){
				var layer = layers[oldLayerIndex];
					
				// remove old layer
				var removeLayerIndex = this.getIndexToLayer_(layer);
				this.layers_.removeAt(removeLayerIndex);
					
				// add new layer
				var index = this.getIndexToLayer_(layers[newLayerIndex]);
				if (newLayerIndex > oldLayerIndex){
					this.layers_.insertAt(index + 1, layer);
					return;
				}
				this.layers_.insertAt(index, layer);	
			};
		}, this)
	});
};

/**
 * @private
 */
vk2.module.LayerManagementModule.prototype.activate_ = function(){
	this.layers_.on('add', this.refresh_, this);
	this.layers_.on('remove', this.refresh_, this);	
};

/**
 * @private
 */
vk2.module.LayerManagementModule.prototype.deactivate_ = function(){
	this.layers_.un('add', this.refresh_, this);
	this.layers_.un('remove', this.refresh_, this);	
};

/**
 * @return {Array.<ol.layer.Base>}
 */
vk2.module.LayerManagementModule.prototype.getLayers = function(){
	return this.layers_.getArray();
};