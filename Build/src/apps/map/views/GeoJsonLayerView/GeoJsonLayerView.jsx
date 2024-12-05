/*
 * Created by tom.schulze@pikobytes.de on 16.10.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback, useEffect, useMemo } from "react";
import {
  horizontalLayoutModeState,
  initialGeoJsonDrawState,
  mapState,
  metadataDrawState,
  selectedGeoJsonFeatureIdentifierState,
  selectedGeoJsonLayerIdState,
  vectorMapDrawState,
} from "@map/atoms";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import clsx from "clsx";
import { translate } from "@util/util";
import { formatDateLocalized } from "@util/date";
import GeoJsonLayerFeatureList from "@map/components/GeoJson/GeoJsonLayerFeatureList";
import GeoJsonPanelHeader from "@map/components/GeoJson/GeoJsonPanelHeader";
import { GeoJsonLayer, METADATA } from "@map/components/CustomLayers";

import "./GeoJsonLayerView.scss";
import { HORIZONTAL_LAYOUT_MODE } from "@map/layouts/util";
import { isVectorMapEditAllowed } from "@map/components/GeoJson/util/authorization";
import {
  GEOJSON_LAYER_VIEW_MODE,
  geoJsonLayerViewLayerState,
  geoJsonLayerViewTimeExtentFilterState,
  geoJsonLayerViewViewModeState,
} from "@map/views/GeoJsonLayerView/atoms";
import { GeoJsonLayerFilters } from "@map/views/GeoJsonLayerView/components/GeoJsonLayerFilters";
import PropTypes from "prop-types";
import GeoJsonLayerActions from "@map/views/GeoJsonLayerView/components/GeoJsonLayerActions";

// TODO DRAWING wrap in ExitTransition component
// TODO DRAWING refactor selectedGeoJsonLayerState (not needed anymore)

const GeoJsonLayerView = ({ selectedLayer }) => {
  const [viewMode, setViewMode] = useRecoilState(geoJsonLayerViewViewModeState);

  const setTimeExtentFilter = useSetRecoilState(
    geoJsonLayerViewTimeExtentFilterState
  );
  const setSelectedGeoJsonLayer = useSetRecoilState(geoJsonLayerViewLayerState);

  const setSelectedGeoJsonLayerId = useSetRecoilState(
    selectedGeoJsonLayerIdState
  );
  const setSelectedGeoJsonFeatureIdentifier = useSetRecoilState(
    selectedGeoJsonFeatureIdentifierState
  );
  const setInitialGeoJsonDraw = useSetRecoilState(initialGeoJsonDrawState);
  const setMetadataDraw = useSetRecoilState(metadataDrawState);
  const setVectorMapDraw = useSetRecoilState(vectorMapDrawState);

  const setHorizontalLayoutMode = useSetRecoilState(horizontalLayoutModeState);

  const map = useRecoilValue(mapState);

  const { title, timePublished, layerId } = useMemo(() => {
    return {
      title: selectedLayer?.getMetadata(METADATA.title),
      timePublished: selectedLayer?.getMetadata(METADATA.timePublished),
      layerId: selectedLayer?.getMetadata(METADATA.id),
    };
  }, [
    selectedLayer?.getMetadata(METADATA.title),
    selectedLayer?.getMetadata(METADATA.timePublished),
  ]);

  const formattedTimePublished = useMemo(
    () => formatDateLocalized(timePublished),
    [timePublished]
  );

  const handleCloseClick = useCallback(() => {
    setSelectedGeoJsonLayerId(null);
    setViewMode(GEOJSON_LAYER_VIEW_MODE.INITIAL);
    setTimeExtentFilter(null);
  }, []);

  const handleEditOpenClick = useCallback(() => {
    setViewMode(GEOJSON_LAYER_VIEW_MODE.EDIT);
    setHorizontalLayoutMode(HORIZONTAL_LAYOUT_MODE.DRAW);
    selectedLayer.setVisibility(map, "none");
    setInitialGeoJsonDraw(selectedLayer.getGeoJson());

    setMetadataDraw({
      [METADATA.title]: selectedLayer.getMetadata(METADATA.title),
      [METADATA.description]: selectedLayer.getMetadata(METADATA.description),
      [METADATA.thumbnailUrl]: selectedLayer.getMetadata(METADATA.thumbnailUrl),
    });

    const vectorMapId = selectedLayer.getMetadata(METADATA.vectorMapId);
    const version = selectedLayer.getMetadata(METADATA.version);

    setVectorMapDraw({
      type: vectorMapId ? "remote" : "local",
      id: vectorMapId ?? null,
      version: version ?? null,
    });
  }, [selectedLayer]);

  const handleEditCloseClick = useCallback(() => {
    selectedLayer.setVisibility(map, "visible");
    setViewMode(GEOJSON_LAYER_VIEW_MODE.INITIAL);
    setHorizontalLayoutMode(HORIZONTAL_LAYOUT_MODE.STANDARD);
  }, [selectedLayer]);

  const handleFeatureClick = useCallback(
    (featureId) => {
      setSelectedGeoJsonFeatureIdentifier({
        featureId,
        sourceId: layerId,
      });
    },
    [layerId]
  );

  useEffect(() => {
    setSelectedGeoJsonLayer(selectedLayer);
    return () => {
      setViewMode(GEOJSON_LAYER_VIEW_MODE.INITIAL);
      setTimeExtentFilter(null);
      setSelectedGeoJsonLayer(null);
    };
  }, [selectedLayer]);

  return (
    <>
      <GeoJsonPanelHeader
        isEditAllowed={isVectorMapEditAllowed(selectedLayer)}
        title={translate("geojsonlayerpanel-header-title")}
        onEditClick={
          viewMode !== GEOJSON_LAYER_VIEW_MODE.EDIT
            ? handleEditOpenClick
            : undefined
        }
        onCloseClick={
          viewMode === GEOJSON_LAYER_VIEW_MODE.EDIT
            ? handleEditCloseClick
            : handleCloseClick
        }
      />
      <div className="headline-container">
        <div className="geojson-headline--date">{formattedTimePublished}</div>
        <div className="title-row">
          <div className="geojson-headline--title">{title}</div>
          <GeoJsonLayerActions />
        </div>
      </div>

      <GeoJsonLayerFilters />

      <GeoJsonLayerFeatureList
        className={clsx(
          "geojson-layer-feature-list-root ",
          viewMode !== GEOJSON_LAYER_VIEW_MODE.EDIT && ["in", "scrollable"]
        )}
        onFeatureClick={handleFeatureClick}
      />
    </>
  );
};

GeoJsonLayerView.propTypes = {
  selectedLayer: PropTypes.instanceOf(GeoJsonLayer),
};

export default GeoJsonLayerView;
