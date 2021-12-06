/**
 * Created by nicolas.looschen@pikobytes.de on 26/11/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { Fragment, useCallback, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import PropTypes from "prop-types";

import {
  facetState,
  map3dState,
  mapSearchListFunctionalityProvidersState,
  mapState,
  timeExtentState,
} from "../../../../atoms/atoms";
import HistoricMap from "../../../layer/HistoricMapLayer";
import ServerPagination from "../../../Source/ServerPaginationSource";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { MAP_SEARCH_HOVER_FEATURE } from "../../../../config/styles";
import { MAP_PROJECTION } from "../../MapSearch";
import { isDefined } from "../../../../../../util/util";
import { SettingsProvider } from "../../../../index";

export const MapSearchFunctionalityProvider = (props) => {
  const { onUpdate } = props;

  // State
  const facets = useRecoilValue(facetState);
  const is3dEnabled = useRecoilValue(map3dState);
  const map = useRecoilValue(mapState);
  const [
    { mapPaginationSource, mapOverlayLayer },
    setMapFunctionalityProviders,
  ] = useRecoilState(mapSearchListFunctionalityProvidersState);
  const timeExtent = useRecoilValue(timeExtentState);

  ////
  // Handler section
  ////

  // keep the overlay layer on top of the map layer stack
  const handleMapLayerChange = useCallback(
    (event) => {
      const topLayer = event.target.getArray().at(-1);

      if (topLayer instanceof HistoricMap || topLayer.get("type") === "click") {
        map.removeLayer(mapOverlayLayer);
        map.addLayer(mapOverlayLayer);
      }
    },
    [map, mapOverlayLayer]
  );

  ////
  // Effect section
  ////

  // Add feature overlay layer shown on hover and the source for the backend fatches
  useEffect(() => {
    if (map !== undefined) {
      const newMapPaginationSource = new ServerPagination({
        is3d: is3dEnabled,
        elasticsearch_node: SettingsProvider.getSettings().API_SEARCH,
        elasticsearch_srs: "EPSG:4326",
        projection: MAP_PROJECTION,
        map: map,
        updateCallback: onUpdate,
      });

      const newMapOverlayLayer = new VectorLayer({
        source: new VectorSource(),
        style: function () {
          return [MAP_SEARCH_HOVER_FEATURE];
        },
      });

      map.addLayer(newMapOverlayLayer);

      setMapFunctionalityProviders({
        mapPaginationSource: newMapPaginationSource,
        mapOverlayLayer: newMapOverlayLayer,
      });
    }
  }, [map]);

  // Update featureOverlay on change of 3d state
  useEffect(() => {
    if (isDefined(mapPaginationSource)) {
      mapPaginationSource.update3dState(is3dEnabled);
    }

    if (is3dEnabled) {
      // in case 3d mode is active add altitude value to coordinate
      mapOverlayLayer.set("altitudeMode", "clampToGround");
    }
  }, [is3dEnabled]);

  // Propagate the timeExtent from global state to the pagination source
  useEffect(() => {
    if (isDefined(mapPaginationSource)) {
      mapPaginationSource.setTimeFilter(timeExtent[0], timeExtent[1]);
      mapPaginationSource.refresh();
    }
  }, [mapPaginationSource, timeExtent]);

  // Propagate the facet state to the pagination source
  useEffect(() => {
    if (isDefined(mapPaginationSource)) {
      mapPaginationSource.setFacets(facets);
    }
  }, [mapPaginationSource, facets]);

  // Add map handler to keep overlay layer on top of the layer stack
  useEffect(() => {
    // hold the overlay layer on top of the historic map layers
    if (isDefined(map) && isDefined(mapOverlayLayer)) {
      map.getLayers().on("add", handleMapLayerChange);
    }
  }, [mapOverlayLayer, map, handleMapLayerChange]);

  return <Fragment />;
};

MapSearchFunctionalityProvider.propTypes = {
  onUpdate: PropTypes.func,
};

export default MapSearchFunctionalityProvider;
