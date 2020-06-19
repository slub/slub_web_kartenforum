goog.provide('vk2.control.ImageManipulation');
goog.provide('vk2.control.ImageManipulation.Filters');

goog.require('vk2.utils');
goog.require('goog.events');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.object');

/**
 * @enum
 */
vk2.control.ImageManipulation.Filters = {
	'brightness': 1,
	'contrast': 1,
	'hue': 0,
	'saturation': 0
};

/**
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} opt_options Control options.
 */
vk2.control.ImageManipulation = function (opt_options) {

	var options = opt_options || {};

	//
	// Create DOM nodes
	//
	var anchorEl = goog.dom.createDom('a', {
			'class': 'ol-has-tooltip',
			'href': '#image-manipulation',
			'innerHTML': 'I'
		}),
		tooltipEl = goog.dom.createDom('span', {
			'role': 'tooltip',
			'innerHTML': vk2.utils.getMsg('imagemanipulation-open')
		}),
		containerEl = goog.dom.createDom('div', {'class': 'image-manipulation ol-unselectable'}),
		sliderContainer = goog.dom.createDom('div', {'class': 'slider-container', 'style': 'display:none;'});
	goog.dom.appendChild(anchorEl, tooltipEl);
	goog.dom.appendChild(containerEl, anchorEl);
	goog.dom.appendChild(containerEl, sliderContainer);

	//
	// Initialize image manipulation tools
	//
	var filters = goog.object.clone(vk2.control.ImageManipulation.Filters),
	// Has the value of an image filter has been changed
		filterUpdate = false,
		// Parameters is true if the handler is registered
		postcomposeRegistered = false,
		/**
		 * @param {string} className
		 * @param {string} orientation
		 * @param {string} key
		 * @param {number=} opt_baseValues
		 * @param {string=} opt_title
		 * @return {Element}
		 * @private
		 */
		createSlider_ = goog.bind(function(className, orientation, key, opt_baseValues, opt_title) {
			var title = goog.isDef('opt_title') ? opt_title : '',
				sliderEl = goog.dom.createDom('div', {
					'class': 'slider ' + className,
					'title': title,
					'data-type': key
				}),
				baseMin = goog.isDef(opt_baseValues) ? opt_baseValues[1] : 0,
				baseMax = goog.isDef(opt_baseValues) ? opt_baseValues[2] : 100,
				steps = goog.isDef(opt_baseValues) ? opt_baseValues[3] : 1,
				minValueEl,
				maxValueEl,
				startValue = goog.isDef(opt_baseValues) ? opt_baseValues[0] : 100;


			/**
			 * Updates the filters and the position attached to a slider
			 * @param {Object} event
			 * @param {Object} ui
			 */
			var update = goog.bind(function (event, ui) {
				var value = ui['value'],
					layer = this.getMap().getLayers().getArray()[0];

				// check if postcompose listener ist registered and if not add the listener
				if (!postcomposeRegistered) {
					// registered the postcompose event listener
					layer.on('postcompose', postcomposeHandler);
					postcomposeRegistered = true;
				}
				;

				// update position of the tooltip
				if (orientation == 'vertical') {
					var style_top = 100 - ((value - baseMin) / (baseMax - baseMin) * 100);
					valueEl.style.top = style_top + '%';
					valueEl.innerHTML = value + '%';
					return;
				}
				;

				var style_left = (value - baseMin) / (baseMax - baseMin) * 100;
				valueEl.style.left = style_left + '%';
				valueEl.innerHTML = value;

				// update filters.
				filters[key] = value;
				filterUpdate = true;
				layer.changed();
			}, this);

			$(sliderEl).slider({
				'min': baseMin,
				'max': baseMax,
				'value': startValue,
				'animate': 'slow',
				'orientation': orientation,
				'step': steps,
				'slide': update,
				'change': update
			});

			// append tooltips
			var innerHtml = goog.isDef(opt_baseValues) ? opt_baseValues[0] : '';
			var valueEl = goog.dom.createDom('div', {
				'class': 'tooltip value ' + className,
				'innerHTML': innerHtml
			});
			goog.dom.appendChild(sliderEl, valueEl);

			return sliderEl;
		}, this),
		//Events adds the filters to the layer.
		postcomposeHandler = function (event) {
			var webglContext = event['glContext'],
				canvas = $('canvas.ol-unselectable')[0];

			if (webglContext !== undefined && webglContext !== null) {
				var gl = webglContext.getGL();

				if (filterUpdate) {
					glif.reset();

					for (var filter in filters) {
						glif.addFilter(filter, filters[filter]);
					}
					;

					filterUpdate = false;
				}

				glif.apply(gl, canvas);

				// for showing openlayers that the program changed
				// if missing openlayers will produce errors because it
				// expected other shaders in the webgl program
				webglContext.useProgram(undefined);
			}
		};

	//
	// Create slider for filters
	//
	var contrastSlider = createSlider_('slider-contrast', 'horizontal', 'contrast',
			[1, 0, 2, 0.01], vk2.utils.getMsg('imagemanipulation-contrast')),
		saturationSlider = createSlider_('slider-saturation', 'horizontal', 'saturation',
			[0, -1, 1, 0.01], vk2.utils.getMsg('imagemanipulation-saturation')),
		brightnessSlider = createSlider_('slider-brightness', 'horizontal', 'brightness',
			[1, 0, 2, 0.1], vk2.utils.getMsg('imagemanipulation-brightness')),
		hueSlider = createSlider_('slider-hue', 'horizontal', 'hue',
			[0, -180, 180, 5], vk2.utils.getMsg('imagemanipulation-hue'))
	goog.dom.appendChild(sliderContainer, contrastSlider);
	goog.dom.appendChild(sliderContainer, saturationSlider);
	goog.dom.appendChild(sliderContainer, brightnessSlider);
	goog.dom.appendChild(sliderContainer, hueSlider);

	//
	// Append button for reset filters
	//
	var resetBtn = goog.dom.createDom('button', {
		'class': 'reset-btn',
		'title': vk2.utils.getMsg('imagemanipulation-reset'),
		'innerHTML': 'Reset'
	});
	goog.dom.appendChild(sliderContainer, resetBtn);

	// append reset button behavior
	goog.events.listen(resetBtn, 'click', function (e) {
		var layer = this.getMap().getLayers().getArray()[0];

		// remove postcomposeHandler
		layer.un('postcompose', postcomposeHandler);
		postcomposeRegistered = false;

		// reset the sliders
		var sliderEls = goog.dom.getElementsByClass('slider', sliderContainer);
		for (var i = 0; i < sliderEls.length; i++) {
			var sliderEl = sliderEls[i],
				type = sliderEl.getAttribute('data-type'),
				value = vk2.control.ImageManipulation.Filters[type];

			$(sliderEl).slider('value', value);
		}
		;
	}, undefined, this);


	//
	// Add open and close toolbox behavior
	//
	var openToolbox = function (event) {
		event.preventDefault();

		if (goog.dom.classes.has(event.target, 'active')) {

			if (goog.DEBUG) {
				console.log('Close ImageManipulation Toolbox');
			}

			goog.dom.classes.remove(event.target, 'active');
			$(sliderContainer).fadeOut().removeClass('open');
			return;
		}

		if (goog.DEBUG) {
			console.log('Open ImageManipulation Toolbox');
		}
		goog.dom.classes.add(event.target, 'active');
		$(sliderContainer).fadeIn().addClass('open');
	};
	goog.events.listen(anchorEl, 'click', openToolbox);
	goog.events.listen(anchorEl, 'touchstart', openToolbox);

	ol.control.Control.call(this, {
		element: containerEl,
		target: options.target
	});
};
ol.inherits(vk2.control.ImageManipulation, ol.control.Control);