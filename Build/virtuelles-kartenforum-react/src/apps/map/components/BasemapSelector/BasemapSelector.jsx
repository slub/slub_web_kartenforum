/**
 * Created by jacob.mendt@pikobytes.de on 08.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState } from "react";
import { FormGroup, Radio } from "react-bootstrap";
import PropTypes from "prop-types";
import SettingsProvider from "../../../../SettingsProvider";
import { createBaseMapLayer } from "../../../../util/geo";
import "./BasemapSelector.scss";

// Test configuration
const defaultConf = [
  {
    id: "slub-osm",
    label: "SLUB OSM",
    urls: [
      "https://basemaps-1.pikobytes.de/styles/maptiler-basic-v2/{z}/{x}/{y}@2x.png",
      "https://basemaps-2.pikobytes.de/styles/maptiler-basic-v2/{z}/{x}/{y}@2x.png",
      "https://basemaps-3.pikobytes.de/styles/maptiler-basic-v2/{z}/{x}/{y}@2x.png",
    ],
    type: "xyz",
    tileSize: 512,
  },
  {
    id: "bkg-topoplus",
    label: "BKG TopoPlus",
    urls: ["https://sgx.geodatenzentrum.de/wms_topplus_open"],
    type: "wms",
    layers: "web",
    tileSize: 512,
  },
];

/**
 * Component for rendering a basemap selector tools
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export const BasemapSelector = (props) => {
  const layers =
    SettingsProvider.getSettings()["BASEMAP_CONFIG"] !== undefined
      ? SettingsProvider.getSettings()["BASEMAP_CONFIG"]
      : defaultConf;
  const [activeLayer, setActiveLayer] = useState(layers[0]);
  const map = props.map;

  // Handler for performing an update of the basemap
  const handleChangeBaseMapLayer = (newLayer) => {
    const layers = map.getLayers();
    const newMapLayer = createBaseMapLayer(
      newLayer.id,
      newLayer.type,
      newLayer.urls,
      newLayer.tileSize,
      newLayer.layers
    );
    const activeMapLayer = layers
      .getArray()
      .find((l) => l.vkf_type === "basemap");

    if (activeMapLayer.vkf_id !== newMapLayer.vkf_id) {
      // expect that the basemap is always at index 0
      layers.removeAt(0);
      layers.insertAt(0, newMapLayer);
    }

    // Signal that it is the current active layer
    setActiveLayer(newLayer);
  };

  return (
    <div className="vkf-basemap-selector">
      <p>Select Basemap:</p>
      <FormGroup>
        {layers.map((l) => (
          <Radio
            key={l.id}
            onClick={() => handleChangeBaseMapLayer(l)}
            name={l.id}
            value={l.id}
            checked={activeLayer.id === l.id}
          >
            {l.label}
          </Radio>
        ))}
      </FormGroup>
    </div>
  );
};

BasemapSelector.propTypes = {
  map: PropTypes.map,
};

export default BasemapSelector;
