/**
 * Created by nicolas.looschen@pikobytes.de on 10/20/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import TileLayer from "ol/layer/Tile";
import { XYZ } from "ol/source";
import { FullScreen, Rotate, ScaleLine, Zoom } from "ol/control";

import { SettingsProvider } from "../apps/map";
import CustomAttribution from "../apps/map/components/MapWrapper/components/CustomAttribution";
import LocateMeControl from "../components/Controls/LocateMeControl";
import ToggleViewMode from "../components/ToggleViewmode/ToggleViewmode";
import LayerSpy from "../components/Controls/LayerSpyControl";
import BasemapSelector from "../apps/map/components/Controls/BasemapSelectorControl";
import { MousePositionOnOff } from "../apps/map/components/MapWrapper/components/MousePositionOnOff";
import { LAYOUT_TYPES } from "../apps/map/layouts/util";

/*
 * ol does not export an inherits function in the current version
 * workaround from here: https://gis.stackexchange.com/questions/324606/ol-inherits-in-openlayers-6
 */
export function inherits(child, parent) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
}

export function isDefined(el) {
    return el !== null && el !== undefined;
}

export function isString(el) {
    return typeof el === "string" || el instanceof String;
}

export function translate(key) {
    const settings = SettingsProvider.getSettings();

    const dictionary = settings["dictionary"];

    if (dictionary === undefined) {
        throw new Error("Dictionary is undefined.");
    }

    const translation = dictionary[key];

    if (translation === undefined) {
        console.warn(
            `Translation for key "${key}" was not found in dictionary.`
        );
        return "";
    } else {
        return translation;
    }
}

/**
 * Returns the default controls for the map view
 **/
export const getDefaultControls = (params) => {
    const { baseMapUrl, is3dActive, layout, map, set3dActive } = params;

    const defaultControls = [
        new CustomAttribution(),
        new FullScreen(),
        new Rotate({ className: "rotate-north ol-unselectable" }),
        new ScaleLine(),
        // new vk2.control.Permalink(),
    ];

    if (layout === LAYOUT_TYPES.HORIZONTAL) {
        defaultControls.push(
            new LocateMeControl({
                map: map,
            }),
            new Zoom(),
            new LayerSpy({
                spyLayer: new TileLayer({
                    attribution: undefined,
                    source: new XYZ({
                        urls: baseMapUrl,
                        crossOrigin: "*",
                        attributions: [],
                    }),
                }),
            }),
            new ToggleViewMode({
                initialState: is3dActive,
                propagateViewMode: set3dActive,
            }),
            new MousePositionOnOff(),
            new BasemapSelector({
                map: map,
            })
        );
    }

    return defaultControls;
};

/**
 * Functions adds a lazy loading behavior to a given array of elements
 *
 * @param {Array.<Element>} elements
 */
export const addLazyLoadingBehavior = function (elements) {
    var $window = $(window),
        isElementInViewport = function (el) {
            var a = $window.scrollTop(),
                b = $window.height(),
                c = $(el).offset().top,
                d = $(el).height();

            return c + d >= a && c <= a + b;
        };
};

const getSizeForDomElement = (id) => {
    const el = document.getElementById(id);
    const elWidth = isDefined(el) ? el.offsetWidth : 0;
    const elHeight = isDefined(el) ? el.offsetHeight : 0;
    return { height: elHeight, width: elWidth };
};

/**
 * @static
 * @param {ol.Map} map
 * @return {Array.<number>}
 */
export const calculateMapExtentForPixelViewport = function (map) {
    const padding = 30;
    const offsetTop = 5;
    const offsetBottom = 25;

    // this is a premise

    const spatialsearchSize = getSizeForDomElement("spatialsearch-container");
    const layermanagementSize = getSizeForDomElement(
        "layermanagement-container"
    );
    const mapSize = getSizeForDomElement("mapdiv");

    // calculate pixelextent
    const lowX = 0 + spatialsearchSize.width + padding;
    const lowY = mapSize.height - offsetBottom - padding;
    const highX = mapSize.width - layermanagementSize.width - padding;
    const highY = offsetTop + padding;

    // get equivalent coordinates
    const llc = map.getCoordinateFromPixel([lowX, lowY]);
    const urc = map.getCoordinateFromPixel([highX, highY]);
    return [llc[0], llc[1], urc[0], urc[1]];
};

/**
 * This function checks if cookies are enabled
 * @static
 */
export const checkIfCookiesAreEnabble = function () {
    if (!navigator.cookieEnabled)
        alert(
            "For proper working of the virtuel map forum 2.0 please activate cookies in your browser"
        );

    if (goog.DEBUG) {
        console.log("Cookies are enabled");
    }
};

/**
 * This function parse the query parameters of the given href. If href is undefined it tooks the actual window.location.href
 * @param {string=} href
 * @return {goog.Uri.QueryData}
 * @static
 */
export const getAllQueryParams = function (href) {
    if (goog.isDef(href)) {
        var url = new goog.Uri(href);
    } else {
        var url = new goog.Uri(window.location.href);
    }

    return url.getQueryData();
};

/**
 * @param {Element} element
 * @param {string} className
 */
export const getClosestParentElementForClass = function (element, className) {
    var newelement = goog.dom.classlist.contains(element, className)
        ? element
        : getClosestParentElementForClass(
              goog.dom.getParentElement(element),
              className
          );
    return newelement;
};

/**
 *
 * This function encapsulate the json lang_dictionary from the locale javascript folder.
 * @static
 * @param {string=} opt_key
 * @return {string}
 */
export const getMsg = function (opt_key) {
    try {
        if (goog.isDef(window["lang_dictionary"]))
            return window["lang_dictionary"][opt_key];
    } catch (ReferenceError) {
        if (goog.DEBUG) console.log("Could not find dictionary.");
        return "";
    }

    return "";
};

/**
 * @param {Array.<number>} extent
 * @return {Array.<Array.<number>>}
 */
export const getPolygonFromExtent = function (extent) {
    return [
        [extent[0], extent[1]],
        [extent[0], extent[3]],
        [extent[2], extent[3]],
        [extent[2], extent[1]],
        [extent[0], extent[1]],
    ];
};

/**
 * This function parse for the given href the query parameter with the given name. If href is undefined it tooks the
 * actual window.location.href
 * @param {string} name
 * @param {string=} opt_href
 * @return {*}
 * @expose
 * @static
 */
export const getQueryParam = function (name, opt_href) {
    if (goog.isDef(opt_href)) {
        return getAllQueryParams(opt_href).get(name);
    } else {
        return getAllQueryParams().get(name);
    }
};

/**
 * @param {string} name
 */
export const getCookie = function (name) {
    return goog.net.cookies.get(name);
};

/**
 * @param {string=} title
 * @param {string=} message
 * @param {Function=} opt_submitCallback
 * @param {string=} opt_classNames
 * @param {boolean=} opt_withoutBtns
 */
export const getConfirmationDialog = function (
    title,
    message,
    opt_submitCallback,
    opt_classNames,
    opt_withoutBtns
) {
    var modal = new Modal("vk2-overlay-modal", document.body, true),
        title = title,
        classes = goog.isDef(opt_classNames) ? opt_classNames : "",
        msg = message,
        withBtns = goog.isDef(opt_withoutBtns) ? opt_withoutBtns : true,
        bodyContent =
            withBtns == true
                ? '<button type="button" class="btn btn-primary" id="confirm-dialog-btn-yes"' +
                  ">" +
                  getMsg("yes") +
                  '</button><button type="button" class="btn btn-primary"' +
                  'id="confirm-dialog-btn-no">' +
                  getMsg("no") +
                  "</button>"
                : "";

    modal.open(title, classes);
    modal.appendStringToBody("<p>" + msg + "</p><br>" + bodyContent);

    if (withBtns == true) {
        var callback = goog.isDef(opt_submitCallback)
            ? opt_submitCallback
            : function () {};
        goog.events.listen(
            goog.dom.getElement("confirm-dialog-btn-yes"),
            "click",
            function (event) {
                callback();
                modal.close();
            }
        );
        goog.events.listen(
            goog.dom.getElement("confirm-dialog-btn-no"),
            "click",
            function (event) {
                modal.close();
            }
        );
    }
};

/**
 * Helper Function which access the ol3d object, which is hidden in the global namespace.
 * @return {olcs.OLCesium|undefined}
 */
export const getOL3D = function () {
    if (is3DMode()) return window["ol3d"];
    return;
};

/**
 * Function checks if the client is logged in. This is checked via the
 * presence of the auth_tkt cookie.
 * @return {boolean}
 */
export const isLoggedIn = function () {
    return goog.isDef(goog.net.cookies.get("auth_tkt")) ? true : false;
};

/**
 * Helper function which checks if an 3d perspective is open feyet
 * @return {boolean}
 */
export const is3DMode = function () {
    return vk2.settings.MODE_3D && window["ol3d"] !== undefined;
};

/**
 * @param {string} className
 * @param {Object=} opt_element
 * @static
 */
export const loadModalOverlayBehavior = function (className, opt_element) {
    var parent_el = goog.isDef(opt_element) ? opt_element : document.body;
    var modal_anchors = goog.dom.getElementsByClass(className, parent_el.body);

    // iteratore over modal_anchors and init the behavior for them
    for (var i = 0; i < modal_anchors.length; i++) {
        goog.events.listen(
            modal_anchors[i],
            goog.events.EventType.CLICK,
            function (e) {
                e.preventDefault();

                try {
                    var modal = new Modal(
                        "vk2-overlay-modal",
                        document.body,
                        true
                    );

                    // parse the modal parameters
                    var title = this["title"];
                    var classes = this.getAttribute("data-classes");
                    var href = this.href;

                    modal.open(title, classes, {
                        href: href,
                        classes: classes,
                    });

                    // stopping the default behavior of the anchor
                    e.preventDefault();
                } catch (e) {
                    if (goog.DEBUG) {
                        console.log(
                            "Error while trying to load remote page in modal."
                        );
                    }
                }
            }
        );
    }
};

/**
 * Functions refreshs the 3d view
 */
export const refresh3DView = function () {
    if (is3DMode() && getOL3D().getEnabled() === true) {
        getOL3D().getAutoRenderLoop().restartRenderLoop();
    }
};

/**
 * Function rounds a float number to a given decimal position
 * @param {number} x
 * @param {number} opt_decimalPosition
 * @return {number}
 */
export const round = function (x, opt_decimalPosition) {
    const d = isDefined(opt_decimalPosition)
        ? Math.pow(10, Math.ceil(opt_decimalPosition))
        : Math.pow(10, 2);
    return Math.round(x * d) / d;
};

/**
 * @param {string} map_container
 * @static
 */
export const overwriteOlTitles = function (map_container) {
    var elements = goog.dom.getElementByClass(
        "ol-overlaycontainer-stopevent",
        goog.dom.getElement(map_container)
    );
    for (var i = 0; i < elements.children.length; i++) {
        var childElement = elements.children[i];
        if (
            goog.dom.classlist.contains(
                childElement.children[0],
                "ol-has-tooltip"
            )
        ) {
            var tooltipEls = goog.dom.getElementsByClass(
                "ol-has-tooltip",
                childElement
            );
            for (var j = 0; j < tooltipEls.length; j++) {
                var tooltipText = tooltipEls[j].children[0].innerHTML;
                tooltipEls[j].setAttribute("title", tooltipText);
            }
        }
    }
};

/**
 * This functions does a get request for a given url_string and calls, if given, the success_callback or error_callback
 * @param {string} url_string
 * @param {Function=} success_callback
 * @param {Function=} error_callback
 * @static
 */
export const sendReport = function (
    url_string,
    success_callback,
    error_callback
) {
    // create request object
    var xhr = new goog.net.XhrIo();

    // add listener to request object
    goog.events.listenOnce(xhr, "success", function (e) {
        var xhr = /** @type {goog.net.XhrIo} */ (e.target);
        if (goog.isDef(success_callback)) success_callback(xhr);
        xhr.dispose();
    });

    goog.events.listenOnce(xhr, "error", function (e) {
        var xhr = /** @type {goog.net.XhrIo} */ (e.target);
        if (goog.isDef(error_callback)) error_callback(xhr);
    });

    // send request
    xhr.send(url_string);
};

/**
 * @export
 * @param {string} name
 * @param {string} value
 */
export const setCookie = function (name, value) {
    goog.net.cookies.set(name, value, undefined, "/");
};

/**
 * @static
 */
export const setProxyUrl = function () {
    var origin = window.location.origin;
    // for opera
    if (!window.location.origin)
        origin = window.location.protocol + "//" + window.location.host;

    vk2.settings.PROXY_URL = origin + "/vkviewer/proxy/?url=";

    if (goog.DEBUG) console.log("Proxy url is: " + vk2.settings.PROXY_URL);
};

/**
 * @param {Element} parentEl
 * @param {number} points
 * @static
 */
export const showAchievedPoints = function (parentEl, points) {
    var container = goog.dom.createDom("div", {
        class: "georef-point-container alert alert-warning",
        style: "display:none;",
    });
    goog.dom.appendChild(parentEl, container);

    container.innerHTML = "+" + points + " " + getMsg("points");
    $(container)
        .fadeIn(1000)
        .effect("puff", {}, 3000, function () {
            container.innerHTML = "";
        });
};

/**
 * This method is used for transforming geo coordinates to pixel coordinates. This is used for
 * correct transform from client side coordinates to the server side standard.
 *
 * @param {Array.<number>} pixel_coordinates
 * @private
 * @returns {Array.<number>}
 */
export const transformGeoCoordsToPixel = function (pixel_coordinates) {
    return [
        Math.round(pixel_coordinates[0]),
        Math.round(-1 * pixel_coordinates[1]),
    ];
};

/**
 * This method is used for transforming pixel coordinates to geo coordinates. This is used for
 * correct displaying of server sides pixel in the client map.
 *
 * @param {Array.<number>} pixel_coordinates
 * @private
 * @returns {Array.<number>}
 */
export const transformPixelToGeoCoords = function (pixel_coordinates) {
    return [
        Math.round(pixel_coordinates[0]),
        Math.round(-1 * pixel_coordinates[1]),
    ];
};
