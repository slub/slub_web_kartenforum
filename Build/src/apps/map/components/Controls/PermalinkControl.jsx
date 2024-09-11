/**
 * Created by nicolas.looschen@pikobytes.de on 11.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

export const PERMALINK_CONTROL_ID = "permalink-control";

//@TODO: Unify with basemap selector control
export class PermalinkControl {
  id = PERMALINK_CONTROL_ID;

  /**
   *
   * @param {{
   * initialBasemapId: string,
   * onBasemapChange: function,
   * }} options
   */
  onAdd(map) {
    this._map = map;
    const defaultClass = `maplibregl-ctrl maplibregl-ctrl-group permalink-control`;

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

export default PermalinkControl;
