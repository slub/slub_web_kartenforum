/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useEffect, useRef, useState } from "react";
import { isDefined, translate } from "../../util/util";
import { mapState } from "../../atoms/atoms";
import { useRecoilValue } from "recoil";
import DeactivateMapCollection from "./DeactiveMapCollection";
import { DynamicMapVisualization } from "./DynamicMapVisualization";
import LayerManagementEntry from "./LayerManagementEntry";

export const LayerManagement = (props) => {
  const map = useRecoilValue(mapState);
  const [displayedLayers, setDisplayedLayers] = useState(undefined);
  const layersRef = useRef();
  const bodyRef = useRef();

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

  const handleRefresh = () => {
    const newLayers = getLayers();
    setDisplayedLayers(newLayers.reverse());
  };

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

  useEffect(() => {
    $(bodyRef.current).sortable({
      revert: true,
      handle: ".drag-btn",
      stop: (event, ui) => {
        const allLayers = layersRef.current.getArray();
        const layers = getLayers();
        const listElements = document.getElementsByClassName(
          "layermanagement-record",
          bodyRef.current
        );

        const oldLayerIndex = parseInt(listElements[ui.item.index()].id, 0);
        const newListIndex = ui.item.index();
        const newLayerIndex = layers.length - newListIndex;

        console.log(oldLayerIndex, oldListIndex, newListIndex);
        // prevent from removing/adding the layer if it was drag on the same place
        if (isDefined(oldLayerIndex) && oldListIndex != newListIndex) {
          const layer = layers[oldLayerIndex];
          const mapLayers = layersRef.current;

          // remove old layer
          const removeLayerIndex = getIndexToLayer(layer);
          console.log(removeLayerIndex);
          mapLayers.removeAt(removeLayerIndex);

          // add new layer
          const index = getIndexToLayer(layers[newLayerIndex]);
          console.log(index);
          if (newLayerIndex > oldLayerIndex) {
            mapLayers.insertAt(index + 1, layer);
            return;
          }
          mapLayers.insertAt(index, layer);
        }
      },
    });
  }, []);

  return (
    <div className="layermanagement-container" id="layermanagement-container">
      <div className="heading">
        <span className="header-label">
          {translate("layermanagement-header-lbl")}
        </span>
        <DeactivateMapCollection />
        <DynamicMapVisualization />
      </div>
      <ul className="layermanagement-body" ref={bodyRef}>
        {displayedLayers === undefined || displayedLayers.length === 0 ? (
          <li className="empty">{translate("layermanagement-start-msg")}</li>
        ) : (
          displayedLayers.map((layer, index) => (
            <LayerManagementEntry
              layer={layer}
              index={getIndexToLayer(layer)}
              key={`${layer.getId()}-${index}`}
            />
          ))
        )}
      </ul>
    </div>
  );
};

export default LayerManagement;
