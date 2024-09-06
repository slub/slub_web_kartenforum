/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { useRecoilValue } from "recoil";
import PropTypes from "prop-types";

import { isDefined, translate } from "../../../../util/util";
import { displayedLayersCountState, mapState } from "../../atoms/atoms";
import DeactivateMapCollection from "./DeactivateMapCollection/DeactivateMapCollection";
import DynamicMapVisualization from "./DynamicMapVisualization/DynamicMapVisualization";
import LayerManagementEntry from "./LayerManagementEntry/LayerManagementEntry";
import { getIndexToLayer, getLayers } from "./util";
import { useSetElementScreenSize } from "../../../../util/hooks.js";
import GeoJsonUploadHint from "./GeoJsonUploadHint/GeoJsonUploadHint.jsx";
import "./LayerManagement.scss";
import CustomEvents from "../MapWrapper/customEvents.js";

export const LayerManagement = ({
  onAddGeoJson,
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
  const [displayedLayers, setDisplayedLayers] = useState(undefined);
  const [displayedLayersCount, setDisplayedLayersCount] = useRecoilState(
    displayedLayersCountState
  );
  const map = useRecoilValue(mapState);

  // refs
  const refLayermanagement = useRef();

  // update layermanagement size in recoil state
  useSetElementScreenSize(refLayermanagement, "layermanagement");

  ////
  // Handler section
  ////

  // @TODO: We can probably do this a little more efficient, by utilizing the new information from the custom events
  // Handles changes on the layer container of the map
  const handleRefresh = useCallback(() => {
    console.log("map");
    if (isDefined(map)) {
      console.log("Handle refresh");
      const newLayers = getLayers(map).reverse();
      console.log(newLayers, getLayers(map));

      setDisplayedLayers(newLayers);
      setDisplayedLayersCount(newLayers.length);
    }
  }, [map]);

  // @TODO: Port to maplibre
  // Handles drag and drop moves
  const handleMoveLayer = (dragIndex, hoverIndex) => {
    const layers = getLayers(map);

    // move the dragged layer to the position of the hovered layer
    if (dragIndex < hoverIndex) {
      const inbeforeLayer = layers[hoverIndex + 1]?.id ?? null;

      map.moveLayer(layers[dragIndex].id, inbeforeLayer);
    } else if (dragIndex > hoverIndex) {
      // move the dragged layer to the position before the hovered layer
      map.moveLayer(layers[dragIndex].id, layers[hoverIndex].id);
    }
  };

  ////
  // Effect section
  ////

  // bind event handlers to layer container of the map
  useEffect(() => {
    if (map !== undefined) {
      const registerListeners = () => {
        console.log("register listeners");
        // set layers initially
        handleRefresh();

        // afterwards bind event handlers
        map.on(CustomEvents.layerAdded, handleRefresh);
        map.on(CustomEvents.layerRemoved, handleRefresh);
        map.on(CustomEvents.layerMoved, handleRefresh);
      };

      if (!map._loaded) {
        console.log("map not loaded");
        map.on("load", registerListeners);
      } else {
        console.log("map loaded");
        registerListeners();
      }

      return () => {
        map.off("load", registerListeners);
        map.off(CustomEvents.layerAdded, handleRefresh);
        map.off(CustomEvents.layerRemoved, handleRefresh);
        map.off(CustomEvents.layerMoved, handleRefresh);
      };
    }
  }, [map, handleRefresh]);

  return (
    <div className="vkf-layermanagement-root" ref={refLayermanagement}>
      {showBadge && displayedLayersCount !== 0 && (
        <span className="badge">{displayedLayersCount}</span>
      )}
      {showHeader && (
        <div className="heading">
          <span className="header-label">
            {translate("layermanagement-header-lbl")}
          </span>
          <div className="header-functions">
            <GeoJsonUploadHint onAddGeoJson={onAddGeoJson} />
            {showHideButton && <DeactivateMapCollection />}
            {showDynamicMapVisualization && (
              <DynamicMapVisualization
                animationOptions={{ delay: 30, steps: 0.01 }}
              />
            )}
          </div>
        </div>
      )}
      <ul className="layermanagement-body">
        {displayedLayers === undefined || displayedLayers.length === 0 ? (
          <li className="empty">
            <h4>{translate("layermanagement-start-msg-header")}</h4>
            <p>{translate("layermanagement-start-msg-body")}</p>
          </li>
        ) : (
          displayedLayers.map((layer) => {
            const layerId = layer.metadata?.["vkf:id"];

            return (
              <LayerManagementEntry
                onMoveLayer={handleMoveLayer}
                layer={layer}
                index={getIndexToLayer(map, layer)}
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
  onAddGeoJson: PropTypes.func,
  showControls: PropTypes.shape({
    showBadge: PropTypes.bool,
    showDynamicMapVisualization: PropTypes.bool,
    showHideButton: PropTypes.bool,
  }),
  showHeader: PropTypes.bool,
};

export default LayerManagement;
