/**
 * Created by jacob.mendt@pikobytes.de on 08.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useEffect, useState } from "react";
import { FormGroup, Glyphicon, Radio } from "react-bootstrap";
import PropTypes from "prop-types";

import SettingsProvider from "../../../../SettingsProvider";
import { createBaseMapLayer } from "../../../../util/geo";
import { isDefined, translate } from "../../../../util/util";
import DialogAddWms from "./DialogAddWms";
import { useLocalStorage } from "../../persistence/util";
import "./BasemapSelector.scss";

export const PERSISTENCE_CUSTOM_BASEMAP_KEYS = "vkf-custom-basemaps";

/**
 * Component for rendering a basemap selector tools
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export const BasemapSelector = (props) => {
  const { forceBasemapId, map, onBasemapChange, onSetNotification } = props;
  const [customLayers, setCustomLayers] = useLocalStorage(
    PERSISTENCE_CUSTOM_BASEMAP_KEYS,
    []
  );
  const layers = SettingsProvider.getBaseMaps();
  const [activeLayer, setActiveLayer] = useState(undefined);
  const [showAddWmsDialog, setShowAddWmsDialog] = useState(false);

  ////
  // Handler section
  ////

  // Handler for performing an update of the basemap
  const handleChangeBaseMapLayer = (newLayer) => {
    const layers = map.getLayers();
    const newMapLayer = createBaseMapLayer(newLayer);
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
    onBasemapChange(newLayer);
  };

  // Handler for opening the add wms dialog
  const handleClickShowAddWmsDialog = () => {
    setShowAddWmsDialog(true);
  };

  const handleDeleteBaseMapLayer = (oldLayer) => {
    const mapLayers = map.getLayers();

    const activeMapLayer = mapLayers
      .getArray()
      .find((l) => l.vkf_type === "basemap");

    if (activeMapLayer.vkf_id === oldLayer.id) {
      handleChangeBaseMapLayer(layers[0]);
    }

    // remove from custom layers state
    setCustomLayers((oldLayers) =>
      oldLayers.filter((l) => l.id !== oldLayer.id)
    );
  };

  // Handler for updating the radio options
  const handleAddNewLayer = (newLayer) => {
    // Check if layer does already exist
    const layerExists = layers.find((l) => l.id === newLayer.id);
    if (!layerExists) {
      newLayer.allowDeletion = true;
      setCustomLayers([...customLayers, newLayer]);
    }
  };

  const handleExternalBasemapUpdate = useCallback(
    (basemapId) => {
      // only update the state if it differs from the current state or if the component is not initialized
      if (activeLayer === undefined || activeLayer.id !== basemapId) {
        const newActiveLayer = isDefined(basemapId)
          ? [...layers, ...customLayers].find((layer) => layer.id === basemapId)
          : layers[0];

        if (newActiveLayer !== undefined) {
          handleChangeBaseMapLayer(newActiveLayer);
        } else {
          // notify user about the error finding the selected base layer
          onSetNotification({
            id: "basemapSelector",
            type: "danger",
            text: translate("control-basemapselector-error-initializiation"),
          });

          // reset the active layer id
          onBasemapChange(activeLayer ?? layers[0]);
        }
      }
    },
    [activeLayer, layers, customLayers]
  );

  ////
  // Effect section
  ////

  useEffect(() => {
    // if an external basemap id is passed, update internal state to match
    if (forceBasemapId !== undefined) {
      handleExternalBasemapUpdate(forceBasemapId);
    }
  }, [forceBasemapId, handleExternalBasemapUpdate]);

  return (
    <React.Fragment>
      {activeLayer !== undefined && (
        <React.Fragment>
          <h4>{translate("control-basemapselector-label")}:</h4>
          <div className="wms-entries">
            {[...layers, ...customLayers].map((l) => (
              <div key={l.id} className="basemap-selector-entry">
                <Radio
                  onChange={() => handleChangeBaseMapLayer(l)}
                  name={l.id}
                  value={l.id}
                  checked={activeLayer.id === l.id}
                >
                  {l.label}
                </Radio>
                {l.allowDeletion && (
                  <button
                    className="delete-basemap-button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteBaseMapLayer(l);
                    }}
                    title="Remove basemap"
                  >
                    <Glyphicon glyph="remove" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="controls-container">
            <button
              className="add-wms-button"
              onClick={handleClickShowAddWmsDialog}
            >
              {translate("control-basemapselector-btn-addwms")}
            </button>
          </div>
        </React.Fragment>
      )}
      {showAddWmsDialog && (
        <DialogAddWms
          onClose={() => setShowAddWmsDialog(false)}
          onSubmit={handleAddNewLayer}
        />
      )}
    </React.Fragment>
  );
};

BasemapSelector.propTypes = {
  forceBasemapId: PropTypes.string,
  map: PropTypes.object,
  onBasemapChange: PropTypes.func,
  onSetNotification: PropTypes.func,
};

export default BasemapSelector;
