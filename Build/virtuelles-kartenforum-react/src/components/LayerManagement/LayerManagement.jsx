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
  const layers = map !== undefined ? map.getLayers() : [];
  const bodyRef = useRef();

  const getLayers = () => {
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
    const l = layers.getArray();
    for (var i = 0, ii = layers.length; i < ii; i++) {
      if (layer === l[i]) {
        return i;
      }
    }
  };

  const handleRefresh = () => {
    const newLayers = getLayers();
    setDisplayedLayers(newLayers);
  };

  useEffect(() => {
    if (map !== undefined) {
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
        var layers = getLayers();
        var listElements = document.getElementsByClassName(
          "layermanagement-record",
          bodyRef.current
        );
        var oldListIndex =
          listElements.length -
          parseInt(listElements[ui.item.index()].id, 0) -
          1;
        var newListIndex = ui.item.index();
        var newLayerIndex = layers.length - 1 - newListIndex;
        var oldLayerIndex = parseInt(listElements[newListIndex].id, 0);

        // prevent from removing/adding the layer if it was drag on the same place
        if (isDefined(oldLayerIndex) && oldListIndex != newListIndex) {
          var layer = layers[oldLayerIndex];

          // remove old layer
          var removeLayerIndex = getIndexToLayer(layer);
          layers.removeAt(removeLayerIndex);

          // add new layer
          var index = getIndexToLayer(layers[newLayerIndex]);
          if (newLayerIndex > oldLayerIndex) {
            layers.insertAt(index + 1, layer);
            return;
          }
          layers.insertAt(index, layer);
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
        {displayedLayers === undefined ? (
          <li className="empty">{translate("layermanagement-start-msg")}</li>
        ) : (
          displayedLayers.map((layer, index) => (
            <LayerManagementEntry layer={layer} index={index} />
          ))
        )}
      </ul>
    </div>
  );
};

export default LayerManagement;
