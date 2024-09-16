/**
 * Created by jacob.mendt@pikobytes.de on 08.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useMemo, useState } from "react";
import { Glyphicon, Radio } from "react-bootstrap";
import PropTypes from "prop-types";

import { translate } from "../../../../util/util";
import DialogAddWms from "./DialogAddWms";
import { useLocalStorage } from "../../persistence/util";
import "./BasemapSelector.scss";
import {
  addWMSLayer,
  addXYZLayer,
  removeWMSLayer,
  removeXYZLayer,
  showVectorBaseMapLayer,
} from "./util.js";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  activeBasemapIdState,
  baseMapStyleLayersState,
} from "../../atoms/atoms.js";
import SettingsProvider from "../../../../SettingsProvider.js";
import { notificationState } from "../../../../atoms/atoms.js";
//@TODO: Only allow one active dialog at the same time
//@TODO: Fix WMS basemap applied after selecting default style (configuration?)
//@TODO: Fix persistence -> Move to effect?
export const PERSISTENCE_CUSTOM_BASEMAP_KEYS = "vkf-custom-basemaps";

/**
 * Component for rendering a basemap selector tools
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export const BasemapSelectorDialog = (props) => {
  const { map } = props;

  const [activeBasemapId, setActiveBasemapId] =
    useRecoilState(activeBasemapIdState);
  const [customLayers, setCustomLayers] = useLocalStorage(
    PERSISTENCE_CUSTOM_BASEMAP_KEYS,
    []
  );

  const layers = SettingsProvider.getBaseMaps();
  const setNotification = useSetRecoilState(notificationState);

  const [showAddWmsDialog, setShowAddWmsDialog] = useState(false);

  ////
  // Handler section
  ////

  const handleSetBasemapLayer = (newLayer) => {
    setActiveBasemapId(newLayer.id);
  };

  // Handler for opening the add wms dialog
  const handleClickShowAddWmsDialog = () => {
    setShowAddWmsDialog(true);
  };

  const handleDeleteBaseMapLayer = (oldLayer) => {
    if (oldLayer.type === "wms") {
      removeWMSLayer(map, oldLayer);
    }

    // Set the first default layer if the deleted layer was active
    if (activeBasemapId === oldLayer.id) {
      setActiveBasemapId(layers[0].id);
    }

    // Remove from custom layers state
    setCustomLayers((oldLayers) =>
      oldLayers.filter((l) => l.id !== oldLayer.id)
    );
  };
  // Handler for updating the radio options
  const handleAddNewLayer = (newLayer) => {
    // Check if the layer already exists in either internal or external layers
    const layerExists = [...layers, ...customLayers].find(
      (l) => l.id === newLayer.id || l.label === newLayer.label
    );

    if (!layerExists) {
      // Add the 'allowDeletion' key to the newLayer object
      const updatedLayer = {
        ...newLayer,
        allowDeletion: true,
      };

      // Add the updated layer to customLayers
      setCustomLayers((oldCustomLayers) => [...oldCustomLayers, updatedLayer]);
    } else {
      // Notify user about the error finding the selected base layer
      setNotification({
        id: "basemapSelector",
        type: "danger",
        text: translate("control-basemapselector-error-initializiation"),
      });
    }
  };

  ////
  // Effect section
  ////

  return (
    <React.Fragment>
      {activeBasemapId !== undefined && (
        <React.Fragment>
          <h2>{translate("control-basemapselector-label")}:</h2>
          <ul className="wms-entries">
            {[...layers, ...customLayers].map((l) => (
              <li key={l.id} className="basemap-selector-entry">
                <Radio
                  onChange={() => handleSetBasemapLayer(l)}
                  name={l.id}
                  value={l.id}
                  checked={activeBasemapId === l.id}
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
              </li>
            ))}
          </ul>
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

BasemapSelectorDialog.propTypes = {
  map: PropTypes.object,
  onBasemapChange: PropTypes.func,
  onSetNotification: PropTypes.func,
  activeBasemapId: PropTypes.string,
};

export default BasemapSelectorDialog;
