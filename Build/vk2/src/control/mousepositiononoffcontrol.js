goog.provide('vk2.control.MousePositionOnOff');

goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events');

goog.require('vk2.utils');

/**
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} opt_options Control options.
 */
vk2.control.MousePositionOnOff = function(opt_options) {

  var options = opt_options || {};

  var anchor = document.createElement('a');
  anchor.href = '#mouse-position';
  anchor.innerHTML = 'M';
  anchor.className = 'ol-has-tooltip';

  var tooltip = goog.dom.createDom('span', {'role':'tooltip','innerHTML':vk2.utils.getMsg('mouseposition-title')})
  goog.dom.appendChild(anchor, tooltip);

  var targetEl = undefined,
      updatePosition = function(event) {
          var map = this.getMap(),
              coordinate = ol.proj.transform(map.getEventCoordinate(event), vk2.settings.MAPVIEW_PARAMS['projection'],
                  'EPSG:4326'),
              roundPos = 3;
          targetEl.innerHTML = 'Lon: ' + vk2.utils.round(coordinate[0], roundPos) + ', Lat: ' + vk2.utils.round(coordinate[1], roundPos);
      },
      toggleMousePosition = goog.bind(function(event) {
          event.preventDefault();

          var activeClass = 'active',
              isActive = !goog.dom.classlist.contains(event['target'], activeClass),
              map = this.getMap(),
              coordinate = ol.proj.transform(map.getEventCoordinate(event), vk2.settings.MAPVIEW_PARAMS['projection'],
                'EPSG:4326');

          // toggle activation on anchor
          goog.dom.classlist.toggle(event['target'], activeClass);

          // initialize container for mouseposition display
          if (targetEl === undefined) {
              var viewport = map.getViewport();
            targetEl = goog.dom.createDom('div', { 'class': 'mouse-position-box', 'innerHTML':''});

              goog.dom.appendChild(viewport, targetEl);
          } else {
            targetEl.innerHTML = '';
          };

          // register / unregister mouse event listener
          if (isActive) {
            goog.events.listen(map.getViewport(), 'mousemove', updatePosition, undefined, this);
          } else {
            goog.events.unlisten(map.getViewport(), 'mousemove', updatePosition, undefined, this);
          }

          // activate behavior
          updatePosition.call(this, [event]);
          goog.dom.classlist.toggle(targetEl, activeClass);
  }, this)

  goog.events.listen(anchor, 'click', toggleMousePosition);
  goog.events.listen(anchor, 'touchstart', toggleMousePosition);

  var element = document.createElement('div');
  element.className = 'mouse-position ol-unselectable';
  element.appendChild(anchor);

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });

};
ol.inherits(vk2.control.MousePositionOnOff, ol.control.Control);