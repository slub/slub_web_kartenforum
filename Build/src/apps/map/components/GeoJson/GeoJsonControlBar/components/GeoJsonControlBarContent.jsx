/**
 * Created by nicolas.looschen@pikobytes.de on 04.12.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { translate } from "@util/util";
import React, { memo, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { GEOJSON_CONTROL_BAR_VIEW_STATE } from "@map/components/GeoJson/GeoJsonControlBar/GeoJsonControlBar";
import { useRecoilValue } from "recoil";
import { geoJsonChangeTrackingState } from "@map/components/GeoJson/util/hooks/useTrackGeoJsonChanges";
import "./GeoJsonControlBarContent.scss";
import ChangeTypography from "@map/components/GeoJson/GeoJsonControlBar/components/ChangeTypography";

const formatChangeCount = (count) => {
  return `x${count}`;
};

export const GeoJsonControlBarContent = ({
  onUpdateViewMode,
  formattedFeatureCount,
  viewState,
}) => {
  const changeTrackingState = useRecoilValue(geoJsonChangeTrackingState);

  useEffect(() => {
    if (changeTrackingState === null) return;
    const hasChanges =
      changeTrackingState.addIds.length > 0 ||
      changeTrackingState.deleteIds.length > 0 ||
      Array.from(changeTrackingState.dirtyMap.values()).some((value) => value);

    if (hasChanges) {
      onUpdateViewMode(GEOJSON_CONTROL_BAR_VIEW_STATE.UNSAVED_FEATURE_CHANGES);
    } else {
      onUpdateViewMode(GEOJSON_CONTROL_BAR_VIEW_STATE.INITIAL);
    }
  }, [changeTrackingState]);

  const changedFeatureCount = useMemo(
    () =>
      changeTrackingState
        ? Array.from(changeTrackingState.dirtyMap.values()).filter((x) => x)
            .length
        : 0,
    [changeTrackingState?.dirtyMap]
  );

  return (
    <div className="control-bar-main">
      <div className="control-bar-content">
        {viewState ===
          GEOJSON_CONTROL_BAR_VIEW_STATE.UNSAVED_FEATURE_CHANGES && (
          <>
            <ChangeTypography
              count={changeTrackingState.addIds.length}
              id="new"
            />
            <span className="separator" />
            <ChangeTypography
              count={-changeTrackingState.deleteIds.length}
              id="deleted"
            />
            <span className="separator" />
            <ChangeTypography
              count={changedFeatureCount}
              id="changed"
              formatFunction={formatChangeCount}
            />
          </>
        )}
        {viewState === GEOJSON_CONTROL_BAR_VIEW_STATE.SHOW_FEATURE_COUNT && (
          <>
            <span className="bold">{formattedFeatureCount}</span>{" "}
            {translate("geojson-control-bar-hint-features-present")}
          </>
        )}

        {viewState === GEOJSON_CONTROL_BAR_VIEW_STATE.NO_TITLE && (
          <span className="bold">
            {translate("geojson-control-bar-hint-add-title")}
          </span>
        )}

        {viewState === GEOJSON_CONTROL_BAR_VIEW_STATE.NO_FEATURES && (
          <span className="bold">
            {translate("geojson-control-bar-hint-add-feature")}
          </span>
        )}
      </div>
    </div>
  );
};

GeoJsonControlBarContent.propTypes = {
  viewState: PropTypes.number.isRequired,
  onUpdateViewMode: PropTypes.func.isRequired,
  formattedFeatureCount: PropTypes.string,
};

export default memo(GeoJsonControlBarContent);
