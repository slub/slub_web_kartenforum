/**
 * Created by nicolas.looschen@pikobytes.de on 29.06.22.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import PropTypes from "prop-types";

import SpatialTemporalSearch from "@map/components/SpatialTemporalSearch/SpatialTemporalSearch";
import SelectedMapList from "@mosaic-map/components/SelectedMapList/SelectedMapList.jsx";
import MosaicMapSearchListElement from "@mosaic-map/components/ListElement/MosaicMapSearchListElement/MosaicMapSearchListElement.jsx";
import MosaicMapOverlayLayer from "@mosaic-map/components/MosaicMapOverlayLayer/MosaicMapOverlayLayer";

import "@map/layouts/HorizontalLayout/HorizontalLayout.scss";
import "./MosaicMapLayout.scss";

export const HorizontalLayout = () => {
  return (
    <React.Fragment>
      <MosaicMapOverlayLayer />
      <div className="vkf-horizontal-layout">
        <div className="spatialsearch-container" id="spatialsearch-container">
          <SpatialTemporalSearch
            customQuery={[{ term: { type: "single_sheet" } }]}
            MapSearchListItemComponent={MosaicMapSearchListElement}
            mosaicMode={true}
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
