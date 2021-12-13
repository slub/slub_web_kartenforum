/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import PropTypes from "prop-types";
import { useRecoilValue } from "recoil";
import { DndProvider } from "react-dnd-multi-backend";
import { HTML5toTouch } from "rdndmb-html5-to-touch";

import { isDefined, translate } from "../../../../util/util";
import { displayedLayersCountState, mapState } from "../../atoms/atoms";
import DeactivateMapCollection from "./DeactivateMapCollection/DeactivateMapCollection";
import DynamicMapVisualization from "./DynamicMapVisualization/DynamicMapVisualization";
import LayerManagementEntry from "./LayerManagementEntry/LayerManagementEntry";
import { getIndexToLayer, getLayers } from "./util";
import "./LayerManagement.scss";

const customBackends = HTML5toTouch.backends.map((backend) => {
  if (backend.id === "touch") {
    return {
      ...backend,
      options: {
        ...backend.options,
        scrollAngleRanges: [
          { start: 30, end: 150 },
          { start: 210, end: 330 },
        ],
      },
    };
  }
  return backend;
});

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

  const map = useRecoilValue(mapState);
  const [displayedLayers, setDisplayedLayers] = useState(undefined);
  const [displayedLayersCount, setDisplayedLayersCount] = useRecoilState(
    displayedLayersCountState
  );
  const [hoveredLayerId, setHoveredLayerId] = useState(undefined);
  const blockRefreshRef = useRef(null);

  ////
  // Handler section
  ////

  // Handles changes on the layer container of the map
  const handleRefresh = useCallback(() => {
    if (!blockRefreshRef.current && isDefined(map)) {
      const newLayers = getLayers(map);
      setDisplayedLayers(newLayers.reverse());
      setDisplayedLayersCount(newLayers.length);
    }
  }, [map]);

  // Handles drag and drop moves
  const handleMoveLayer = (dragIndex, hoverIndex) => {
    // block all but the last refresh
    blockRefreshRef.current = true;
    const layers = map.getLayers();

    const bigIndex = dragIndex > hoverIndex ? dragIndex : hoverIndex;
    const smallIndex = dragIndex < hoverIndex ? dragIndex : hoverIndex;

    const layerA = layers.item(bigIndex);
    const layerB = layers.item(smallIndex);

    layers.removeAt(bigIndex);
    layers.removeAt(smallIndex);

    layers.insertAt(smallIndex, layerA);
    blockRefreshRef.current = false;
    layers.insertAt(bigIndex, layerB);
  };

  ////
  // Effect section
  ////

  // bind event handlers to layer container of the map
  useEffect(() => {
    if (map !== undefined) {
      // set layers initially
      handleRefresh();

      // afterwards bind event handlers
      const layers = map.getLayers();
      layers.on("add", handleRefresh);
      layers.on("remove", handleRefresh);
      return () => {
        layers.un("add", handleRefresh);
        layers.un("remove", handleRefresh);
      };
    }
  }, [map, handleRefresh]);

  return (
    <DndProvider
      options={Object.assign({}, HTML5toTouch, {
        backends: customBackends,
      })}
    >
      <div className="vkf-layermanagement-root">
        {showBadge && displayedLayersCount !== 0 && (
          <span className="badge">{displayedLayersCount}</span>
        )}
        {showHeader && (
          <div className="heading">
            <span className="header-label">
              {translate("layermanagement-header-lbl")}
            </span>
            {showHideButton && <DeactivateMapCollection />}
            {showDynamicMapVisualization && (
              <DynamicMapVisualization
                animationOptions={{ delay: 30, steps: 0.01 }}
              />
            )}
          </div>
        )}
        <ul className="layermanagement-body">
          {displayedLayers === undefined || displayedLayers.length === 0 ? (
            <li className="empty">{translate("layermanagement-start-msg")}</li>
          ) : (
            displayedLayers.map((layer) => {
              const layerId = layer.getId();

              return (
                <LayerManagementEntry
                  hovered={layerId === hoveredLayerId}
                  onUpdateHover={setHoveredLayerId}
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
    </DndProvider>
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
