/**
 * Created by nicolas.looschen@pikobytes.de on 16.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { Control } from "ol/control";

import { isDefined, translate } from "../../util/util";
import "./LayerSpyControl.scss";

export class LayerSpyControl extends Control {
  mousePosition = null;

  constructor(opt_options) {
    const options = opt_options || {};

    const element = document.createElement("div");
    element.className = "ol-layerspy ol-unselectable ol-control";

    const button = document.createElement("button");
    button.title = translate("control-layerspy-title");
    button.type = "button";

    element.appendChild(button);

    super({ element, target: options.target });

    this.clipRadius = isDefined(options.radius)
      ? parseInt(options.radius, 0)
      : 75;

    if (options.refSpyLayer !== undefined) {
      options.refSpyLayer.current = this;
    }

    this.refActiveBasemapId = options.refActiveBasemapId;

    this.containerEl = button;

    this.renderRadiusbox =
      opt_options.renderRadiusBox === undefined
        ? true
        : opt_options.renderRadiusBox;

    button.addEventListener("click", (e) => {
      e.preventDefault();
      if (this.containerEl.classList.contains("active")) {
        this.deactivate();
      } else {
        this.activate();
      }
    });

    if (isDefined(options.spyLayer)) {
      // Initial set a spy layer
      this.changeLayer(options.spyLayer);
    }
  }

  /**
   * Handle the activation of the spy layer, by adding the layer to the map and registering event handlers
   */
  activate = () => {
    if (this.layers === undefined) {
      this.layers = this.getMap().getLayers();
    }
    this.getMap().addLayer(this.layer);
    this.layer.on("prerender", this.handlePrecompose, this);
    this.layer.on("postrender", this.handlePostcompose, this);
    const viewPort = this.getMap().getViewport();
    viewPort.addEventListener("mousemove", this.handleMouseMove);
    viewPort.addEventListener("mouseout", this.handleMouseOut);
    document.addEventListener("keydown", this.handleKeyPress);
    this.layers.on("add", this.handleAddedLayer);
    this.containerEl.classList.add("active");

    // render a box with the radius
    if (this.renderRadiusbox) {
      this.renderTargetElement();
    }
  };

  /**
   * Change the active spy layer
   * @param newLayer
   */
  changeLayer = (newLayer) => {
    const isActive = this.containerEl.classList.contains("active");
    if (isActive) {
      this.deactivate();
      this.layer = newLayer;
      this.activate();
    } else {
      this.layer = newLayer;
    }
  };

  /**
   * Handle the deactivation of the spy layer, by removing the layer from the map and removing all previously registered
   * event handlers
   */
  deactivate = () => {
    this.layer.un("prerender", this.handlePrecompose);
    this.layer.un("postrender", this.handlePostcompose);
    const viewPort = this.getMap().getViewport();
    viewPort.removeEventListener("mousemove", this.handleMouseMove);
    viewPort.removeEventListener("mouseout", this.handleMouseOut);
    document.removeEventListener("keydown", this.handleKeyPress);
    this.layers.un("add", this.handleAddedLayer);
    this.getMap().removeLayer(this.layer);
    this.containerEl.classList.remove("active");

    // hide the radius box
    if (this.renderRadiusbox) {
      this.renderTargetElement();
    }
  };

  handlePostcompose = (e) => {
    const ctx = e["context"];
    ctx.restore();
  };

  handlePrecompose = (e) => {
    const ctx = e["context"];
    const pixelRatio = e["frameState"]["pixelRatio"];
    ctx.save();
    ctx.beginPath();

    const mousePosition = this.mousePosition;

    if (mousePosition) {
      // get transform from basemap canvas
      const transform = this.getMap()
        .getLayers()
        .getArray()
        .find((l) => {
          return l.vkf_id === this.refActiveBasemapId.current;
        }).renderer_.context.canvas.style.transform;

      // transform point with the rotation
      let point = new DOMPoint(mousePosition[0], mousePosition[1]);
      const rotationMatrix = new DOMMatrix(transform);
      point = point.matrixTransform(rotationMatrix.invertSelf());

      // only show a circle around the mouse
      ctx.arc(
        point.x * pixelRatio,
        point.y * pixelRatio,
        this.clipRadius * pixelRatio,
        0,
        2 * Math.PI
      );

      ctx.lineWidth = 5 * pixelRatio;
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.stroke();
    }
    ctx.clip();
  };

  handleMouseMove = (event) => {
    this.mousePosition = this.getMap().getEventPixel(event);
    this.getMap().render();
  };

  handleMouseOut = () => {
    this.mousePosition = null;
    this.getMap().render();
  };

  handleKeyPress = (event) => {
    const eventTargetTag = event.target.tagName.toLowerCase();

    // because the keyhandler is registered on the document - in order to not miss any events - filter events by tag
    // only non input events should be handled
    if (eventTargetTag !== "input") {
      // for handling this events in webkit
      if (event.key.toLowerCase() === "y" || event.keyCode === "KeyY") {
        this.clipRadius = Math.min(this.clipRadius + 5, 150);
        this.getMap().render();
      } else if (event.key.toLowerCase() === "x" || event.keyCode === "KeyX") {
        this.clipRadius = Math.max(this.clipRadius - 5, 25);
        this.getMap().render();
      }

      this.updateClipRadiusDisplay();
    }
  };

  handleAddedLayer = (event) => {
    const topLayer = event.target.getArray()[event.target.getLength() - 1];
    if (topLayer !== this.layer) {
      this.getMap().removeLayer(this.layer);
      this.getMap().addLayer(this.layer);
    }
  };

  handleExternal3dStateUpdate = (new3dState) => {
    this.containerEl.disabled = new3dState;

    if (new3dState) {
      this.containerEl.classList.add("disabled");
    } else {
      this.containerEl.classList.remove("disabled");
    }
  };

  updateClipRadiusDisplay = () => {
    const targetEl = this.targetEl;

    targetEl.innerHTML = `Radius: ${this.clipRadius}px <br/> (${translate(
      "control-layerspy-radius-tooltip"
    )})`;
  };

  toggleTargetElement = () => {
    if (this.targetEl !== undefined) {
      const isActive = this.targetEl.classList.contains("active");
      if (isActive) {
        this.targetEl.classList.remove("active");
      } else {
        this.targetEl.classList.add("active");
      }
    }
  };

  renderTargetElement = () => {
    let targetEl = this.targetEl;
    // add target element if it is not defined
    if (this.targetEl === undefined) {
      const viewport = this.getMap().getViewport();
      targetEl = document.createElement("div");
      targetEl.className = "ol-control ol-layerspy-radius-box";
      targetEl.innerHTML = "";

      viewport.appendChild(targetEl);
      this.targetEl = targetEl;
    }

    // toggle Element and update its contents
    this.toggleTargetElement();
    this.updateClipRadiusDisplay();
  };
}

export default LayerSpyControl;
