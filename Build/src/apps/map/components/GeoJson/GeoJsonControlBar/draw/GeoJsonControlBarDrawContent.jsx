/**
 * Created by nicolas.looschen@pikobytes.de on 04.12.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { translate } from "@util/util";
import React, { memo, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { DRAW_CONTROL_BAR_VIEW_STATE } from "@map/components/GeoJson/GeoJsonControlBar/GeoJsonControlBarDraw";
import { useRecoilValue } from "recoil";
import { geoJsonChangeTrackingState } from "@map/components/GeoJson/util/hooks/useTrackGeoJsonChanges";
import "./GeoJsonControlBarDrawContent.scss";
import ChangeTypography from "@map/components/GeoJson/GeoJsonControlBar/draw/ChangeTypography";

const formatChangeCount = (count) => {
  return `x${count}`;
};

export const GeoJsonControlBarDrawContent = ({
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
      onUpdateViewMode(DRAW_CONTROL_BAR_VIEW_STATE.UNSAVED_FEATURE_CHANGES);
    } else {
      onUpdateViewMode(DRAW_CONTROL_BAR_VIEW_STATE.INITIAL);
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
    <>
      {viewState === DRAW_CONTROL_BAR_VIEW_STATE.UNSAVED_FEATURE_CHANGES && (
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
      {viewState === DRAW_CONTROL_BAR_VIEW_STATE.SHOW_FEATURE_COUNT && (
        <>
          <span className="bold">{formattedFeatureCount}</span>{" "}
          {translate("geojson-control-bar-hint-features-present")}
        </>
      )}

      {viewState === DRAW_CONTROL_BAR_VIEW_STATE.NO_TITLE && (
        <span className="bold">
          {translate("geojson-control-bar-hint-add-title")}
        </span>
      )}

      {viewState === DRAW_CONTROL_BAR_VIEW_STATE.NO_FEATURES && (
        <span className="bold">
          {translate("geojson-control-bar-hint-add-feature")}
        </span>
      )}
    </>
  );
};

GeoJsonControlBarDrawContent.propTypes = {
  viewState: PropTypes.number.isRequired,
  onUpdateViewMode: PropTypes.func.isRequired,
  formattedFeatureCount: PropTypes.string,
};

export default memo(GeoJsonControlBarDrawContent);
