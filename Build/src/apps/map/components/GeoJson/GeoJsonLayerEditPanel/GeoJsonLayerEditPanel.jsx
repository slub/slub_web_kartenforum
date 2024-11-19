/*
 * Created by tom.schulze@pikobytes.de on 16.10.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback } from "react";
import { useRecoilValue } from "recoil";
import PropTypes from "prop-types";

import { translate } from "@util/util";
import {
  drawState,
  mapState,
  selectedGeoJsonLayerState,
  selectedLayersState,
} from "@map/atoms";
import CustomButton from "@map/components/GeoJson/components/CustomButton";
import VkfIcon from "@components/VkfIcon";

import "./GeoJsonLayerEditPanel.scss";

const GeoJsonEditPanel = ({ className }) => {
  const draw = useRecoilValue(drawState);
  const { selectedLayer } = useRecoilValue(selectedGeoJsonLayerState);
  const selectedLayers = useRecoilValue(selectedLayersState);
  const map = useRecoilValue(mapState);

  const handleSave = useCallback(() => {
    // TODO DRAWING set numeric ids for newly added features
    console.log(draw.getAll());
    selectedLayer.setDataOnMap(map, draw.getAll());
  }, [draw, selectedLayer, selectedLayers]);

  return (
    <div className={className}>
      <div className="content">
        <CustomButton className="save-button" onClick={handleSave} type="save">
          <VkfIcon name="save" />
          {translate("geojson-featureview-save-btn")}
        </CustomButton>
      </div>
    </div>
  );
};

GeoJsonEditPanel.propTypes = {
  className: PropTypes.string,
};

export default GeoJsonEditPanel;
