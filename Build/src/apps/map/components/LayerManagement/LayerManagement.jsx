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
  const refBlockRefresh = useRef(null);
  const refLayermanagement = useRef();

  // update layermanagement size in recoil state
  useSetElementScreenSize(refLayermanagement, "layermanagement");

  ////
  // Handler section
  ////

  // Handles changes on the layer container of the map
  const handleRefresh = useCallback(() => {
    console.log(refBlockRefresh.current, isDefined(map), map?.isStyleLoaded());

    if (!refBlockRefresh.current && isDefined(map)) {
      const newLayers = getLayers(map).reverse();
      console.log(newLayers);

      setDisplayedLayers(newLayers);
      setDisplayedLayersCount(newLayers.length);
    }
  }, [map]);

  // @TODO: Port to maplibre
  // Handles drag and drop moves
  const handleMoveLayer = (dragIndex, hoverIndex) => {
    // block all but the last refresh
    // refBlockRefresh.current = true;
    // const layers = map.getLayers();
    //
    // const bigIndex = dragIndex > hoverIndex ? dragIndex : hoverIndex;
    // const smallIndex = dragIndex < hoverIndex ? dragIndex : hoverIndex;
    //
    // const layerA = layers.item(bigIndex);
    // const layerB = layers.item(smallIndex);
    //
    // layers.removeAt(bigIndex);
    // layers.removeAt(smallIndex);
    //
    // layers.insertAt(smallIndex, layerA);
    // refBlockRefresh.current = false;
    // layers.insertAt(bigIndex, layerB);
  };

  ////
  // Effect section
  ////

  // bind event handlers to layer container of the map
  useEffect(() => {
    if (map !== undefined) {
      const registerListeners = () => {
        // set layers initially
        handleRefresh();

        // afterwards bind event handlers
        map.on(CustomEvents.layerAdded, handleRefresh);
        map.on(CustomEvents.layerRemoved, handleRefresh);
      };

      if (!map.isStyleLoaded()) {
        map.on("load", registerListeners);
      }

      return () => {
        map.off("load", registerListeners);
        map.off(CustomEvents.layerAdded, handleRefresh);
        map.off(CustomEvents.layerRemoved, handleRefresh);
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
