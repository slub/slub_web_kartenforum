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
import { useSetElementScreenSize } from "../../../../util/hooks.js";
import "./LayerManagement.scss";
import GeoJsonUploadHint from "./GeoJsonUploadHint/GeoJsonUploadHint.jsx";

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
  const [hoveredLayerId, setHoveredLayerId] = useState(undefined);
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
    if (!refBlockRefresh.current && isDefined(map)) {
      const newLayers = getLayers(map);
      setDisplayedLayers(newLayers.reverse());
      setDisplayedLayersCount(newLayers.length);
    }
  }, [map]);

  // Handles drag and drop moves
  const handleMoveLayer = (dragIndex, hoverIndex) => {
    // block all but the last refresh
    refBlockRefresh.current = true;
    const layers = map.getLayers();

    const bigIndex = dragIndex > hoverIndex ? dragIndex : hoverIndex;
    const smallIndex = dragIndex < hoverIndex ? dragIndex : hoverIndex;

    const layerA = layers.item(bigIndex);
    const layerB = layers.item(smallIndex);

    layers.removeAt(bigIndex);
    layers.removeAt(smallIndex);

    layers.insertAt(smallIndex, layerA);
    refBlockRefresh.current = false;
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
  onAddGeoJson: PropTypes.func,
  showControls: PropTypes.shape({
    showBadge: PropTypes.bool,
    showDynamicMapVisualization: PropTypes.bool,
    showHideButton: PropTypes.bool,
  }),
  showHeader: PropTypes.bool,
};

export default LayerManagement;
