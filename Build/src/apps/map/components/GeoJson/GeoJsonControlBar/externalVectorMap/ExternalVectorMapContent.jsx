/*
 * Created by tom.schulze@pikobytes.de on 06.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { memo } from "react";
import PropTypes from "prop-types";
import { EXTERNAL_CONTROL_BAR_VIEW_STATE } from "../GeoJsonControlBarExternalVectorMap";
import { translate } from "@util/util";

const ExternalVectorMapContent = ({ formattedFeatureCount, viewState }) => {
  return (
    <>
      {viewState === EXTERNAL_CONTROL_BAR_VIEW_STATE.SHOW_FEATURE_COUNT && (
        <>
          <span className="bold">{formattedFeatureCount}</span>{" "}
          {translate("geojson-control-bar-hint-features-present")}
        </>
      )}

      {viewState === EXTERNAL_CONTROL_BAR_VIEW_STATE.NO_TITLE && (
        <span className="bold">
          {translate("geojson-control-bar-hint-add-title")}
        </span>
      )}

      {viewState === EXTERNAL_CONTROL_BAR_VIEW_STATE.NO_FEATURES && (
        <span className="bold">
          {translate("geojson-control-bar-hint-add-content-url")}
        </span>
      )}
    </>
  );
};

ExternalVectorMapContent.propTypes = {
  viewState: PropTypes.number.isRequired,
  formattedFeatureCount: PropTypes.string,
};
export default memo(ExternalVectorMapContent);
