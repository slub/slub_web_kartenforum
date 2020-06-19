/**
 * Created by mendt on 01.03.16.
 */
/**
 * @type {Object}
 */
var olcs;

/**
 * @constructor
 */
olcs.AutoRenderLoop = function() {};

/**
 *
 */
olcs.AutoRenderLoop.prototype.restartRenderLoop = function() {};

/**
 * @constructor
 * @param {Object} scene
 * @þaram {Object} map
 */
olcs.Camera = function(scene, map) {};

/**
 * @return {number}
 */
olcs.Camera.prototype.getAltitude = function() {};

/**
 * @return {ol.Coordinate|undefined}
 */
olcs.Camera.prototype.getCenter = function() {};

/**
 * @return {number}
 */
olcs.Camera.prototype.getDistance = function() {};

/**
 * @return {ol.Coordinate|undefined}
 */
olcs.Camera.prototype.getPosition = function() {};

/**
 * @return {number}
 */
olcs.Camera.prototype.getTilt = function() {};

/**
 * @param {number} altitude
 */
olcs.Camera.prototype.setAltitude = function(altitude) {};

/**
 * @param {ol.Coordinate} center
 */
olcs.Camera.prototype.setCenter = function(center) {};

/**
 * @param {number} distance
 */
olcs.Camera.prototype.setDistance = function(distance) {};

/**
 * @param {ol.Coordinate} position
 */
olcs.Camera.prototype.setPosition = function(position) {};

/**
 * @param {number} tilt
 */
olcs.Camera.prototype.setTilt = function(tilt) {};

/**
 * @constructor
 * @param {Object} options
 */
olcs.OLCesium = function(options) {};

/**
 *
 */
olcs.OLCesium.prototype.enableAutoRenderLoop = function() {};

/**
 * @return {olcs.AutoRenderLoop}
 */
olcs.OLCesium.prototype.getAutoRenderLoop = function() {};

/**
 * @return {olcs.Camera}
 */
olcs.OLCesium.prototype.getCamera = function() {};

/**
 * @return {Cesium.Scene}
 */
olcs.OLCesium.prototype.getCesiumScene = function() {};

/**
 * @return {boolean}
 */
olcs.OLCesium.prototype.getEnabled = function() {};

/**
 * @return {ol.Map}
 */
olcs.OLCesium.prototype.getOlMap = function() {};

/**
 * @param {boolean} enable
 */
olcs.OLCesium.prototype.setEnabled = function(enable) {};

/**
 * @namespace
 */
olcs.OLCesium.core = {};

/**
 * @param {Cesium.Scene} scene
 * @param {Cesium.Cartesian3} pivot
 */
olcs.OLCesium.core.computeAngleToZenith = function(scene, pivot){};

/**
 * @param {Cesium.Scene} scene
 */
olcs.OLCesium.core.pickBottomPoint = function(scene){};

/**
 * @param {Cesium.Camera} camera
 * @param {number} angle
 * @param {Cesium.Cartesian3} axis
 * @param {Cesium.Matrix4} transform
 * @param {Object} options
 */
olcs.OLCesium.core.rotateAroundAxis = function(camera, angle, axis, transform){};