goog.provide('vk2.control.DeactivateMapCollection');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('vk2.utils');

/**
 * @param {Element} parentEl
 * @param {ol.Map} map
 * @constructor
 */
vk2.control.DeactivateMapCollection = function(parentEl, map){

	//
	// Create container DOM nodes
	//
	var containerEl_ = goog.dom.createDom('div', {'class':'deactivate-map-col-control'});
	goog.dom.appendChild(parentEl, containerEl_);

	//
	// Create control button
	//
	var className = 'deactivate',
		controlAnchor_ = goog.dom.createDom('a', {
			'href':'#',
			'innerHTML': 'D',
			'class': className,
			'title': vk2.utils.getMsg('deactivatemap-all')
		});
	goog.dom.appendChild(containerEl_, controlAnchor_);

	//
	// Couple behavior with control button
	//
	var toggleDeactivateMapCollection_ = function(event) {
		var visible = false;

		if (goog.dom.classes.has(controlAnchor_, className)){
			goog.dom.classes.remove(controlAnchor_, className);
			controlAnchor_['title'] = vk2.utils.getMsg('activatemap-all');
		} else {
			goog.dom.classes.add(controlAnchor_, className);
			controlAnchor_['title'] = vk2.utils.getMsg('deactivatemap-all');
			visible = true;
		};

		// get all historic map layers and set visibility to false
		var layers = map.getHistoricMapLayer();

		for (var i = 0; i < layers.length; i++) {
			layers[i]['setVisible'](visible);
		}

		// update the 3d view
		vk2.utils.refresh3DView();
	};

	goog.events.listen(controlAnchor_, 'click', toggleDeactivateMapCollection_);
	goog.events.listen(controlAnchor_, 'touchstart', toggleDeactivateMapCollection_);

};