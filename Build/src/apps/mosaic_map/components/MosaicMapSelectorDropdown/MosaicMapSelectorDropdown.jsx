/**
 * Created by nicolas.looschen@pikobytes.de on 30.06.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useState } from "react";
import { Glyphicon } from "react-bootstrap";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import ControlDropDown from "@georeferencer/components/ControlDropDown";
import { getMosaicMaps } from "@util/apiMosaicMaps.js";
import {
  mosaicMapLoadingState,
  MosaicMapLoadingStates,
  mosaicMapSelectedLayersState,
  mosaicMapSelectedMosaicMapState,
} from "@mosaic-map/atoms";
import { translate } from "@util/util.js";
import { fetchLayerForMapId } from "@map/persistence/api.js";
import { notificationState } from "@atoms";
import { mapState } from "@map/atoms";

import "./MosaicMapSelectorDropdown.scss";
import {
  MOSAIC_MAP_OVERLAY_SOURCE_ID,
  resetMosaicOverlaySource,
} from "@mosaic-map/components/MosaicMapOverlayLayer/MosaicMapOverlayLayer.jsx";
import useZoomLayerToExtent from "@map/components/LayerManagement/LayerManagementEntry/components/ZoomToExtentButton/useZoomLayerToExtent";

export const VALUE_CREATE_NEW_MAP = "create-new-mosaic-map";

export const MosaicMapSelectorDropdown = () => {
  const [loadingState, setLoadingState] = useRecoilState(mosaicMapLoadingState);
  const [isLoading, setIsLoading] = useState(
    loadingState === MosaicMapLoadingStates.DOWNLOADING_LIST
  );
  const map = useRecoilValue(mapState);
  const [mosaicMapList, setMosaicMapList] = React.useState([]);
  const [selectedMosaicMap, setSelectedMosaicMap] = useRecoilState(
    mosaicMapSelectedMosaicMapState
  );
  const setSelectedMosaicLayers = useSetRecoilState(
    mosaicMapSelectedLayersState
  );
  const setNotification = useSetRecoilState(notificationState);

  const { zoomToExtentMosaicMap } = useZoomLayerToExtent();

  const fetchMosaicMapList = () => {
    setIsLoading(true);
    getMosaicMaps()
      .then((mosaicMapList) => {
        setMosaicMapList(mosaicMapList);
        setIsLoading(false);
        setLoadingState((oldLoadingState) =>
          oldLoadingState === MosaicMapLoadingStates.DOWNLOADING_LIST
            ? MosaicMapLoadingStates.NOT_LOADING
            : oldLoadingState
        );
      })
      .catch((error) => {
        console.error(error);
        setNotification({
          id: "mosaic-map-failed-load-list",
          type: "danger",
          text: translate("mosaic-map-error-messages-failed-load-list"),
        });
      });
  };

  // Handle click Transformation
  const handleSelectMosaicMap = (newMosaicMap) => {
    const newSelectedMosaicMap = mosaicMapList.find(
      (mosaicMap) => mosaicMap.id === newMosaicMap
    ) ?? {
      id: VALUE_CREATE_NEW_MAP,
    };

    setSelectedMosaicMap(newSelectedMosaicMap);

    if (newSelectedMosaicMap.raw_map_ids !== undefined) {
      const fetchProcesses = newSelectedMosaicMap.raw_map_ids.map((id) =>
        fetchLayerForMapId(id)
      );

      Promise.all(fetchProcesses)
        .then((layers) => {
          if (map !== undefined) {
            zoomToExtentMosaicMap(layers);
          }

          resetMosaicOverlaySource(map);

          setSelectedMosaicLayers(layers);
          layers.forEach((layer) =>
            layer.addToOverlay(map, MOSAIC_MAP_OVERLAY_SOURCE_ID)
          );
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      setSelectedMosaicLayers([]);
      resetMosaicOverlaySource(map);
    }
  };

  // refresh the list when signalized by the downloading list state
  useEffect(() => {
    if (
      loadingState === MosaicMapLoadingStates.DOWNLOADING_LIST &&
      isLoading === false
    ) {
      fetchMosaicMapList();
    }
  }, [loadingState]);

  // load initial list
  useEffect(() => {
    fetchMosaicMapList();
  }, []);

  return (
    <ControlDropDown
      id="control-toggle-transformation"
      activeControl={selectedMosaicMap.id}
      className="control-toggle-mosaic-map"
      disableActiveBehavior={true}
      IconComponent={Glyphicon}
      options={[
        ...mosaicMapList.map((mosaicMap) => ({
          ...mosaicMap,
          iconClassName: "th-large",
        })),
        {
          iconClassName: "plus",
          id: VALUE_CREATE_NEW_MAP,
          title: translate("mosaic-maps-create-new"),
        },
      ]}
      onClick={handleSelectMosaicMap}
      parentIconClassName={
        selectedMosaicMap.id === VALUE_CREATE_NEW_MAP ? "plus" : "th-large"
      }
    />
  );
};

export default MosaicMapSelectorDropdown;
