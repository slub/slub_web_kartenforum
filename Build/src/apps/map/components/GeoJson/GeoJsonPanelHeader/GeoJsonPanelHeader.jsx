/**
 * Created by pouria.rezaei@pikobytes.de on 10/12/24.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { isDefined } from "@util/util";
import CustomButton from "@map/components/GeoJson/components/CustomButton";
import VkfIcon from "@components/VkfIcon";

import "./GeoJsonPanelHeader.scss";

const GeoJsonPanelHeader = ({
  extraButton,
  isEditAllowed = true,
  title,
  onCloseClick,
  onEditClick,
}) => {
  const isEditView = useMemo(() => !isDefined(onEditClick), [onEditClick]);

  return (
    <div className="geojson-panel-header-root">
      <div className="header-buttons">
        {isDefined(extraButton) && extraButton}
        {!isEditView && (
          <CustomButton
            disabled={!isEditAllowed}
            className="edit-button"
            onClick={onEditClick}
            type="edit"
          >
            <VkfIcon name="edit" />
          </CustomButton>
        )}
        <CustomButton className="close-button" onClick={onCloseClick}>
          <VkfIcon name="close" />
        </CustomButton>
      </div>
      <div className="header-info">
        <span className="header-title">{title}</span>
      </div>
    </div>
  );
};

GeoJsonPanelHeader.propTypes = {
  extraButton: PropTypes.node,
  isEditAllowed: PropTypes.bool,
  title: PropTypes.string.isRequired,
  onCloseClick: PropTypes.func.isRequired,
  onEditClick: PropTypes.func,
};

export default GeoJsonPanelHeader;
