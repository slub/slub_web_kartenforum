goog.provide('vk2.control.LayerSpy');

goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.KeyCodes');
goog.require('goog.dom');
goog.require('goog.dom.classes')
goog.require('vk2.utils');

/**
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} opt_options Control options.
 */
vk2.control.LayerSpy = function (opt_options) {

	var options = opt_options || {};

	//
	// Set init properties
	//
	var layer = goog.isDef(options['spyLayer']) ? options['spyLayer'] : new ol.layer.Tile({
			'attribution': undefined,
			'source': new ol.source.OSM({'attribution': undefined})
		}),
		clipRadius_ = goog.isDef(options.radius) ? parseInt(options.radius, 0) : 75,
		// get the pixel position with every move
		mousePosition = null;

	//
	// Create DOM contorl elements
	//
	var controlEl = goog.dom.createDom('a', {'class': 'ol-has-tooltip', 'href': '#layerspy', 'innerHTML': 'L'}),
		containerEl = goog.dom.createDom('div', {'class': 'ol-layerspy ol-unselectable'}),
		tooltipEl = goog.dom.createDom('span', {'role': 'tooltip', 'innerHTML': vk2.utils.getMsg('layerspy-title')})

	goog.dom.appendChild(containerEl, controlEl);
	goog.dom.appendChild(controlEl, tooltipEl);

	//
	// event handlers for interacting with the map
	//
	var eventHandlers = {
		postcompose: function (event) {
			// before rendering the layer, do some clipping
			var ctx = event['context'];
			ctx.restore();
		},
		precompose: function (event) {
			// before rendering the layer, do some clipping
			var ctx = event['context'];
			var pixelRatio = event['frameState']['pixelRatio'];
			ctx.save();
			ctx.beginPath();

			if (mousePosition) {
				// only show a circle around the mouse
				ctx.arc(mousePosition[0] * pixelRatio, mousePosition[1] * pixelRatio, clipRadius_ * pixelRatio, 0, 2 * Math.PI);
				ctx.lineWidth = 5 * pixelRatio;
				ctx.strokeStyle = 'rgba(0,0,0,0.5)';
				ctx.stroke();
			}
			ctx.clip();
		},
		mousemove: function (event) {
			mousePosition = this.getMap().getEventPixel(event.event_);
			this.getMap().render();
		},
		mouseout: function () {
			mousePosition = null;
			this.getMap().render();
		},
		keyhandler: function (event) {
			if (goog.DEBUG)
				console.log('KeyDown event with code ' + event.keyCode);

			// for handling this events in webkit
			if (event.keyCode === goog.events.KeyCodes.Y) {
				clipRadius_ = Math.min(clipRadius_ + 5, 150);
				this.getMap().render();
			} else if (event.keyCode === goog.events.KeyCodes.X) {
				clipRadius_ = Math.max(clipRadius_ - 5, 25);
				this.getMap().render();
			}
		},
		addlayer: function (event) {
			var topLayer = event.target.getArray()[event.target.getLength() - 1];
			if (topLayer !== layer) {
				this.getMap().removeLayer(layer);
				this.getMap().addLayer(layer);
			}
			;
		}
	};

	//
	// activate / deactivate spy glass event listeners
	//
	var keyHandler_ = null,
		activate_ = goog.bind(function(controlEl, layer, eventHandlers){
			// activate critical layerspy behavior
			this.getMap().addLayer(layer);
			layer.on('precompose', eventHandlers.precompose, this);
			layer.on('postcompose', eventHandlers.postcompose, this);
			goog.events.listen(this.getMap().getViewport(),'mousemove', eventHandlers.mousemove, undefined, this);
			goog.events.listen(this.getMap().getViewport(),'mouseout', eventHandlers.mouseout, undefined, this);
			goog.dom.classes.add(controlEl, 'active');

			// activate advanced layerspy behavior
			keyHandler_ = keyHandler_ || new goog.events.KeyHandler(document);
			goog.events.listen(keyHandler_, goog.events.KeyHandler.EventType.KEY, eventHandlers.keyhandler, undefined, this);

			// add event listener for holding the spylayer on top of all other layers
			this.getMap().getLayers().on('add', eventHandlers.addlayer, this);
		}, this),
		deactivate_ = goog.bind(function(controlEl, layer, eventHandlers){
			// deactivate critical layerspy behavior
			layer.un('precompose', eventHandlers.precompose, this);
			layer.un('postcompose', eventHandlers.postcompose, this);
			goog.events.unlisten(this.getMap().getViewport(),'mousemove', eventHandlers.mousemove, undefined, this);
			goog.events.unlisten(this.getMap().getViewport(),'mouseout', eventHandlers.mouseout, undefined, this);
			this.getMap().removeLayer(layer);
			goog.dom.classes.remove(controlEl, 'active');

			// deactivate advanced layerspy behavior
			goog.events.unlisten(keyHandler_, goog.events.KeyHandler.EventType.KEY, eventHandlers.keyhandler, undefined, this);
			this.getMap().getLayers().un('add', eventHandlers.addlayer, this);
		}, this);

	goog.events.listen(controlEl, goog.events.EventType.CLICK, goog.bind(function (event) {
		event.preventDefault();
		if (goog.dom.classes.has(controlEl, 'active')) {
			deactivate_(controlEl, layer, eventHandlers);
		} else {
			activate_(controlEl, layer, eventHandlers);
		}
	}, this));

	ol.control.Control.call(this, {
		'element': containerEl,
		'target': options.target
	});
};
ol.inherits(vk2.control.LayerSpy, ol.control.Control);