/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useMemo, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import PropTypes from "prop-types";

import { isDefined, translate } from "@util/util";
import {
  mapState,
  selectedGeoJsonLayerIdState,
  selectedLayersState,
} from "@map/atoms";
import DeactivateMapCollection from "./DeactivateMapCollection";
import DynamicMapVisualization from "./DynamicMapVisualization";
import LayerManagementEntry from "./LayerManagementEntry";
import "./LayerManagement.scss";
import clsx from "clsx";
import VkfIcon from "@components/VkfIcon";
import GeoJsonActionContainer from "@map/components/LayerManagement/GeoJsonActionContainer/GeoJsonActionContainer";

export const LayerManagement = ({
  showControls = {
    showBadge: true,
    showHideButton: true,
    showDynamicMapVisualization: true,
  },
  showHeader = true,
}) => {
  const { showBadge, showDynamicMapVisualization, showHideButton } =
    showControls;

  // state
  const [showGeojsonCreate, setShowGeojsonCreate] = useState(false);
  const map = useRecoilValue(mapState);
  const selectedGeoJsonLayerId = useRecoilValue(selectedGeoJsonLayerIdState);
  const [selectedLayers, setSelectedLayers] =
    useRecoilState(selectedLayersState);

  const isGeoJsonLayerSelected = useMemo(
    () => isDefined(selectedGeoJsonLayerId),
    [selectedGeoJsonLayerId]
  );

  // The selected features should be displayed from top most map layer to bottom most map layer
  // In the array they are stored as [bottom, ..., top] layer, therefore we need to reverse it to display it correctly
  const layersInDisplayOrder = useMemo(
    () => selectedLayers.toReversed(),
    [selectedLayers]
  );

  ////
  // Handler section
  ////

  // Handles drag and drop moves
  const handleMoveLayer = (dragIndex, hoverIndex) => {
    // clone layers in display order
    const newSelectedLayers = [...layersInDisplayOrder];

    // Remove the dragged layer from the array
    const draggedLayer = newSelectedLayers.splice(dragIndex, 1)[0];

    // Insert the dragged layer at the new position
    newSelectedLayers.splice(hoverIndex, 0, draggedLayer);

    // Get the layer that is before the new position
    const inbeforeIndex = hoverIndex - 1;
    const inbeforeLayer =
      inbeforeIndex < 0
        ? null
        : newSelectedLayers[inbeforeIndex].getMapLibreLayerId();

    // Update the layer order on the map
    draggedLayer.move(map, inbeforeLayer);

    // Update the layer order in application state
    setSelectedLayers(newSelectedLayers.reverse());
  };

  const handleClickGeojsonButton = () => {
    setShowGeojsonCreate((oldValue) => !oldValue);
  };

  return (
    <div
      className={clsx(
        "vkf-layermanagement-root",
        !isGeoJsonLayerSelected && "in",
        showGeojsonCreate && "show-controls"
      )}
    >
      {showBadge && selectedLayers.length !== 0 && (
        <span className="badge">{selectedLayers.length}</span>
      )}
      {showHeader && (
        <div className="heading">
          <span className="header-label">
            {translate("layermanagement-header-lbl")}
          </span>
          <div className="header-functions">
            <span className="deco-caret">
              <VkfIcon name="caret" />
            </span>
            <button
              className="geojson-upload"
              onClick={handleClickGeojsonButton}
            >
              <VkfIcon name="uploadVectorMap" />
              <span className="label" id="geojson-upload-label">
                {translate("geojson-adddialog-title")}
              </span>
            </button>
            {showHideButton && <DeactivateMapCollection />}
            {showDynamicMapVisualization && (
              <DynamicMapVisualization
                animationOptions={{ delay: 30, steps: 0.01 }}
              />
            )}
          </div>
        </div>
      )}

      <GeoJsonActionContainer />
      <ul className="layermanagement-body">
        {selectedLayers === undefined || selectedLayers.length === 0 ? (
          <li className="empty">
            <h4>{translate("layermanagement-start-msg-header")}</h4>
            <p>{translate("layermanagement-start-msg-body")}</p>
          </li>
        ) : (
          layersInDisplayOrder.map((layer, index) => {
            const layerId = layer.getId();

            return (
              <LayerManagementEntry
                onMoveLayer={handleMoveLayer}
                layer={layer}
                index={index}
                key={layerId}
                id={layerId}
              />
            );
          })
        )}
      </ul>
    </div>
  );
};

LayerManagement.propTypes = {
  showControls: PropTypes.shape({
    showBadge: PropTypes.bool,
    showDynamicMapVisualization: PropTypes.bool,
    showHideButton: PropTypes.bool,
  }),
  showHeader: PropTypes.bool,
};

export default LayerManagement;
