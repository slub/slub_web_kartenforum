/**
 * Created by nicolas.looschen@pikobytes.de on 29.06.22.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useRef } from "react";
import PropTypes from "prop-types";

import SpatialTemporalSearch from "../../map/components/SpatialTemporalSearch/SpatialTemporalSearch";
import { useSetElementScreenSize } from "../../../util/hooks";
import SelectedMapList from "../components/SelectedMapList/SelectedMapList.jsx";
import MosaicMapSearchListElement from "../components/ListElement/MosaicMapSearchListElement/MosaicMapSearchListElement.jsx";
import MosaicMapOverlayLayer from "../components/MosaicMapOverlayLayer/MosaicMapOverlayLayer";

import "../../map/layouts/HorizontalLayout/HorizontalLayout.scss";
import "./MosaicMapLayout.scss";

export const HorizontalLayout = () => {
  //refs
  const spatialSearchRef = useRef(null);

  useSetElementScreenSize(spatialSearchRef, "spatialtemporalsearch");

  return (
    <React.Fragment>
      <MosaicMapOverlayLayer />
      <div className="vkf-horizontal-layout">
        <div
          className="spatialsearch-container"
          id="spatialsearch-container"
          ref={spatialSearchRef}
        >
          <SpatialTemporalSearch
            customQuery={[{ term: { type: "single_sheet" } }]}
            MapSearchListItemComponent={MosaicMapSearchListElement}
          />
        </div>
        <div className="selected-maps-container">
          <SelectedMapList />
        </div>
      </div>
    </React.Fragment>
  );
};

HorizontalLayout.propTypes = {
  onAddGeoJson: PropTypes.func,
};

export default HorizontalLayout;
