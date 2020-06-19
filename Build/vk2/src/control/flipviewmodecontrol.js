/**
 * Created by mendt on 04.03.16.
 */
goog.provide('vk2.control.FlipViewMode');

goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events');

/**
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} opt_options Control options.
 */
vk2.control.FlipViewMode = function(opt_options) {

    var options = opt_options || {};

    /**
     * @type {!Element}
     * @private
     */
    this.anchor_ = document.createElement('a');

    this.anchor_.href = '#flip-view-mode';
    this.anchor_.className = vk2.utils.is3DMode() && vk2.utils.getOL3D().getEnabled() ? 'ol-has-tooltip three-d' :
        'ol-has-tooltip two-d';
    this.addAnchorInnerHTML_(vk2.utils.is3DMode() && vk2.utils.getOL3D().getEnabled() ? '2D' : '3D');

    var infoMessage = goog.dom.createDom('div', {
        'class': 'info-message',
        'innerHTML': vk2.utils.getMsg('flipviewmode-zoomin')
    });

    var element = document.createElement('div');
    element.className = 'flip-view-mode ol-unselectable';
    element.appendChild(this.anchor_);
    element.appendChild(infoMessage);


    var activate3d_ = function() {
            if (vk2.utils.is3DMode()) {
                var ol3d = vk2.utils.getOL3D(),
                    scene = ol3d.getCesiumScene(),
                    camera = scene.camera,
                    bottom = olcs.core.pickBottomPoint(scene),
                    angle = Cesium.Math.toRadians(50),
                    transform = Cesium.Matrix4.fromTranslation(bottom);

                // 2d -> 3d transition
                ol3d.setEnabled(true);

                    // take care that every time the view is reset when zoom out
                olcs.core.rotateAroundAxis(camera, -angle, camera.right, transform, {
                    'duration': 500
                });
            };
        },
        deactivate3d_ = function() {
            if (vk2.utils.is3DMode()) {
                var ol3d = vk2.utils.getOL3D(),
                    scene = ol3d.getCesiumScene(),
                    camera = scene.camera,
                    bottom = olcs.core.pickBottomPoint(scene),
                    transform = Cesium.Matrix4.fromTranslation(bottom),
                    angle = olcs.core.computeAngleToZenith(scene, bottom);

                if (!ol3d.getEnabled())
                    return;

                // 3d -> 2d transition
                olcs.core.rotateAroundAxis(camera, -angle, camera.right, transform, {
                    'callback': function() {
                        ol3d.setEnabled(false);
                        var view = ol3d.getOlMap().getView();
                        var resolution = view.getResolution();
                        var rotation = view.getRotation();

                        view.setResolution(view.constrainResolution(resolution));
                        view.setRotation(view.constrainRotation(rotation));
                    }
                });
            }
        },
        handler_ = goog.bind(function(event) {
            event.preventDefault();

            if (goog.dom.classlist.contains(this.anchor_, 'flip-mode-3d')) {
                this.switchControlMode('2d');
                deactivate3d_();
            } else {
                var view = this.getMap().getView(),
                    min3DZoom = 3;

                if (view.getZoom() < min3DZoom) {
                    goog.dom.classlist.add(infoMessage, 'open');
                    setTimeout(function() { goog.dom.classlist.remove(infoMessage, 'open');}, 4000);
                    //ol3d.getOlMap().once('moveend', switchTo3D);
                    //view.setZoom(min3DZoom);
                } else {
                    this.switchControlMode('3d');
                    activate3d_();
                };
            };
        }, this);

    if (goog.DEBUG) {
        window['activate'] = activate3d_;
        window['deactivate'] = deactivate3d_;
    }

    goog.events.listen(this.anchor_, 'click', handler_, undefined, this);
    goog.events.listen(this.anchor_, 'touchstart', handler_, undefined, this);

    ol.control.Control.call(this, {
        element: element,
        target: options.target
    });

};
ol.inherits(vk2.control.FlipViewMode, ol.control.Control);

/**
 * @param {string} text
 * @private
 */
vk2.control.FlipViewMode.prototype.addAnchorInnerHTML_ = function(text) {
    this.anchor_.innerHTML = text;
    var tooltip = goog.dom.createDom('span', {'role':'tooltip','innerHTML': vk2.utils.getMsg('flipviewmode-title')})
    goog.dom.appendChild(this.anchor_, tooltip);
};

/**
 * Switches the mode of the control element between three- and two-d mode
 * @param {string} mode
 */
vk2.control.FlipViewMode.prototype.switchControlMode = function(mode) {
    if (mode.toLowerCase() === '2d') {
        goog.dom.classlist.remove(this.anchor_, 'flip-mode-3d');
        this.addAnchorInnerHTML_('2D');
    } else if (mode.toLowerCase() === '3d') {
        goog.dom.classlist.add(this.anchor_, 'flip-mode-3d');
        this.addAnchorInnerHTML_('3D');
    };
};