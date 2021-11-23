/**
 * Created by nicolas.looschen@pikobytes.de on 16.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import TileLayer from "ol/layer/Tile";
import OSMSource from "ol/source/OSM";
import { Control } from "ol/control";
import { isDefined, translate } from "../../util/util";
import "./OlControlLayerSpy.scss";

export class OlControlLayerSpy extends Control {
  mousePosition = null;

  constructor(opt_options) {
    const options = opt_options || {};

    const element = document.createElement("div");
    element.className = "ol-layerspy ol-unselectable ol-control";

    const button = document.createElement("button");
    button.title = translate("layerspy-title");
    button.type = "button";

    element.appendChild(button);

    super({ element, target: options.target });

    this.clipRadius = isDefined(options.radius)
      ? parseInt(options.radius, 0)
      : 75;

    this.layer = isDefined(options["spyLayer"])
      ? options["spyLayer"]
      : new TileLayer({
          attribution: undefined,
          source: new OSMSource({ attribution: undefined }),
        });

    this.containerEl = button;

    button.addEventListener("click", (e) => {
      e.preventDefault();
      if (this.containerEl.classList.contains("active")) {
        this.deactivate();
      } else {
        this.activate();
      }
    });
  }

  activate = () => {
    if (this.layers === undefined) {
      this.layers = this.getMap().getLayers();
    }

    this.getMap().addLayer(this.layer);
    this.layer.on("prerender", this.precompose, this);
    this.layer.on("postrender", this.postcompose, this);
    const viewPort = this.getMap().getViewport();
    viewPort.addEventListener("mousemove", this.mousemove);
    viewPort.addEventListener("mouseout", this.mouseout);
    viewPort.addEventListener("keydown", this.keyhandler);
    this.layers.on("add", this.handleAddedLayer);
    this.containerEl.classList.add("active");
  };

  deactivate = () => {
    this.layer.un("precompose", this.precompose);
    this.layer.un("postcompose", this.postcompose);
    const viewPort = this.getMap().getViewport();
    viewPort.removeEventListener("mousemove", this.mousemove);
    viewPort.removeEventListener("mouseout", this.mouseout);
    viewPort.removeEventListener("keydown", this.keyhandler);
    this.layers.un("add", this.handleAddedLayer);
    this.getMap().removeLayer(this.layer);
    this.containerEl.classList.remove("active");
  };

  postcompose = (e) => {
    const ctx = e["context"];
    ctx.restore();
  };

  precompose = (e) => {
    const ctx = e["context"];
    const pixelRatio = e["frameState"]["pixelRatio"];
    ctx.save();
    ctx.beginPath();

    const mousePosition = this.mousePosition;

    if (mousePosition) {
      // only show a circle around the mouse
      ctx.arc(
        mousePosition[0] * pixelRatio,
        mousePosition[1] * pixelRatio,
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

  mousemove = (event) => {
    this.mousePosition = this.getMap().getEventPixel(event);
    this.getMap().render();
  };

  mouseout = () => {
    this.mousePosition = null;
    this.getMap().render();
  };

  keyhandler = (event) => {
    // for handling this events in webkit
    if (event.keyCode === "Y") {
      this.clipRadius = Math.min(this.clipRadius + 5, 150);
      this.getMap().render();
    } else if (event.keyCode === "X") {
      this.clipRadius = Math.max(this.clipRadius - 5, 25);
      this.getMap().render();
    }
  };

  handleAddedLayer = (event) => {
    const topLayer = event.target.getArray()[event.target.getLength() - 1];
    if (topLayer !== this.layer) {
      this.getMap().removeLayer(this.layer);
      this.getMap().addLayer(this.layer);
    }
  };
}

export default OlControlLayerSpy;
