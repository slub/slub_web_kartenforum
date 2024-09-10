/**
 * Created by jacob.mendt@pikobytes.de on 07.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { translate } from "../../../../util/util";

export const UNIQUE_CONTROL_PANEL_CLASS = "vkf-unique-control-panel";

export const BASEMAP_SELECTOR_CONTROL_ID = "basemap-selector";

export class BasemapSelectorControl {
  id = BASEMAP_SELECTOR_CONTROL_ID;

  /**
   *
   * @param {{
   * initialBasemapId: string,
   * onBasemapChange: function,
   * }} options
   */
  onAdd(map) {
    this._map = map;
    const defaultClass = `maplibregl-ctrl maplibregl-ctrl-group basemap-selector ${UNIQUE_CONTROL_PANEL_CLASS}`;

    // Load default html and behavior
    const container = document.createElement("div");
    container.className = defaultClass;

    this._container = container;

    return container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

export default BasemapSelectorControl;
