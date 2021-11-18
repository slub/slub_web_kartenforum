/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";

import { translate } from "../../util/util";
import { mapState } from "../../atoms/atoms";
import DeactivateMapCollection from "./DeactivateMapCollection/DeactivateMapCollection";
import DynamicMapVisualization from "./DynamicMapVisualization/DynamicMapVisualization";
import LayerManagementEntry from "./LayerManagementEntry";
import "./LayerManagement.scss";

export const LayerManagement = () => {
  const map = useRecoilValue(mapState);
  const [displayedLayers, setDisplayedLayers] = useState(undefined);
  const blockRefreshRef = useRef(null);
  const bodyRef = useRef();
  const layersRef = useRef();

  const getLayers = () => {
    const layers = layersRef.current;
    const allLayers = layers.getArray();
    const l = [];
    allLayers.forEach((layer) => {
      if (layer.allowUseInLayerManagement) {
        l.push(layer);
      }
    });
    return l;
  };

  const getIndexToLayer = (layer) => {
    const layers = layersRef.current;
    const l = layers.getArray();
    return l.findIndex((lay) => lay === layer);
  };

  ////
  // Handler section
  ////

  // Handles changes on the layer container of the map
  const handleRefresh = () => {
    if (blockRefreshRef.current) return;
    const newLayers = getLayers();
    setDisplayedLayers(newLayers.reverse());
  };

  // Handles drag and drop moves
  const handleMoveLayer = (dragIndex, hoverIndex) => {
    // block all but the last refresh
    blockRefreshRef.current = true;
    const layers = layersRef.current;

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
      const layers = map.getLayers();
      layersRef.current = layers;
      layers.on("add", handleRefresh);
      layers.on("remove", handleRefresh);
      return () => {
        layers.un("add", handleRefresh);
        layers.un("remove", handleRefresh);
      };
    }
  }, [map]);

  return (
    <div className="layermanagement-container" id="layermanagement-container">
      <div className="heading">
        <span className="header-label">
          {translate("layermanagement-header-lbl")}
        </span>
        <DeactivateMapCollection />
        <DynamicMapVisualization />
      </div>
      {displayedLayers !== undefined && displayedLayers.length !== 0 && (
        <span className="badge">{displayedLayers.length}</span>
      )}
      <ul className="layermanagement-body" ref={bodyRef}>
        {displayedLayers === undefined || displayedLayers.length === 0 ? (
          <li className="empty">{translate("layermanagement-start-msg")}</li>
        ) : (
          displayedLayers.map((layer) => (
            <LayerManagementEntry
              onMoveLayer={handleMoveLayer}
              layer={layer}
              index={getIndexToLayer(layer)}
              key={layer.getId()}
              id={layer.getId()}
            />
          ))
        )}
      </ul>
    </div>
  );
};

export default LayerManagement;
