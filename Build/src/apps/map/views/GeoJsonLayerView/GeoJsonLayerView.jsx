/*
 * Created by tom.schulze@pikobytes.de on 16.10.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback, useEffect, useMemo } from "react";
import {
  mapState,
  selectedGeoJsonFeatureIdentifierState,
  selectedGeoJsonLayerIdState,
} from "@map/atoms";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import clsx from "clsx";
import { isDefined, translate } from "@util/util";
import GeoJsonLayerFeatureList from "@map/components/GeoJson/GeoJsonLayerFeatureList";
import GeoJsonPanelHeader from "@map/components/GeoJson/GeoJsonPanelHeader";
import {
  EXTERNAL_CONTENT_TYPES,
  GeoJsonLayer,
  METADATA,
} from "@map/components/CustomLayers";

import {
  isExternalVectorMapEditAllowed,
  isVectorMapEditAllowed,
} from "@map/components/GeoJson/util/authorization";
import {
  GEOJSON_LAYER_VIEW_MODE,
  geoJsonLayerViewLayerState,
  geoJsonLayerViewTimeExtentFilterState,
  geoJsonLayerViewViewModeState,
} from "@map/views/GeoJsonLayerView/atoms";
import { GeoJsonLayerFilters } from "@map/views/GeoJsonLayerView/components/GeoJsonLayerFilters";
import PropTypes from "prop-types";
import GeoJsonLayerActions from "@map/views/GeoJsonLayerView/components/GeoJsonLayerActions";
import { useHorizontalDrawMode } from "@map/components/GeoJson/util/hooks/useHorizontalDrawMode";
import { useHorizontalExternalVectorMapMode } from "@map/components/GeoJson/util/hooks/useHorizontalExternalVectorMapMode";

import "./GeoJsonLayerView.scss";
import {
  VkfFeatureItem,
  IdohistFeatureItem,
} from "@map/components/GeoJson/GeoJsonLayerFeatureList/FeatureItem";

const canUserEdit = (selectedLayer) => {
  if (!isDefined(selectedLayer)) {
    return false;
  }

  if (selectedLayer.isExternalVectorMap()) {
    return isExternalVectorMapEditAllowed();
  }

  return isVectorMapEditAllowed(selectedLayer);
};

// TODO cleanup GEOJSON_LAYER_VIEW_MODE, i think edit mode is not needed
// it was used before the horizontal modes were introduced and
// another view was opened within the panel itself

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

  const { editVectorMap } = useHorizontalDrawMode();
  const { editExternalVectorMap } = useHorizontalExternalVectorMapMode();

  const map = useRecoilValue(mapState);

  const { title, description, displayTime, layerId } = useMemo(() => {
    return {
      title: selectedLayer?.getMetadata(METADATA.title),
      description: selectedLayer?.getMetadata(METADATA.description),
      displayTime: selectedLayer?.getDisplayTime(),
      layerId: selectedLayer?.getMetadata(METADATA.id),
    };
  }, [selectedLayer]);

  const formattedDisplayTime = useMemo(() => {
    return displayTime ?? translate("geojson-featureview-no-time");
  }, [displayTime]);

  const FeatureItem = useMemo(() => {
    const contentType = selectedLayer.getMetadata(METADATA.externalContentType);

    if (contentType === EXTERNAL_CONTENT_TYPES.IDOHIST) {
      return IdohistFeatureItem;
    }

    return VkfFeatureItem;
  }, [selectedLayer]);

  const handleCloseClick = useCallback(() => {
    setSelectedGeoJsonLayerId(null);
    setViewMode(GEOJSON_LAYER_VIEW_MODE.INITIAL);
    setTimeExtentFilter(null);
  }, []);

  const handleEditOpenClick = useCallback(async () => {
    try {
      if (selectedLayer.isExternalVectorMap()) {
        await editExternalVectorMap(selectedLayer);
      } else {
        await editVectorMap(selectedLayer);
      }
    } catch (error) {
      console.error(error);
      return;
    }
  }, [selectedLayer]);

  const handleEditCloseClick = useCallback(() => {
    selectedLayer.setVisibility(map, "visible");
    setViewMode(GEOJSON_LAYER_VIEW_MODE.INITIAL);
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
        title={translate("geojsonlayerpanel-header-title")}
        onEditClick={
          viewMode !== GEOJSON_LAYER_VIEW_MODE.EDIT &&
          canUserEdit(selectedLayer)
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
        <div className="geojson-headline--date">{formattedDisplayTime}</div>
        <div className="title-row">
          <div className="geojson-headline--title">{title}</div>
          <GeoJsonLayerActions />
        </div>
        <div className="description-row">
          <div className="geojson-headline--description">{description}</div>
        </div>
      </div>

      <GeoJsonLayerFilters />

      <GeoJsonLayerFeatureList
        className={clsx(
          "geojson-layer-feature-list-root ",
          viewMode !== GEOJSON_LAYER_VIEW_MODE.EDIT && ["in", "scrollable"]
        )}
        onFeatureClick={handleFeatureClick}
        FeatureItem={FeatureItem}
      />
    </>
  );
};

GeoJsonLayerView.propTypes = {
  selectedLayer: PropTypes.instanceOf(GeoJsonLayer),
};

export default GeoJsonLayerView;
