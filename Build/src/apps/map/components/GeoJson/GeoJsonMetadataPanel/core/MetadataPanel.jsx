/*
 * Created by tom.schulze@pikobytes.de on 28.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import PropTypes from "prop-types";
import React, { useCallback } from "react";

import VkfIcon from "@components/VkfIcon";
import { translate } from "@util/util";

import GeoJsonPanelHeader from "../../GeoJsonPanelHeader";
import CustomButton from "../../components/CustomButton";

import "./MetadataPanel.scss";

const MetadataPanel = ({
  title,
  introText,
  submitButton,
  onClose,
  dangerZoneComponent,
  showDangerZone,
  formComponent,
}) => {
  const handleCloseClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div className="geojson-metadata-panel-root">
      <GeoJsonPanelHeader title={title} onCloseClick={handleCloseClick} />
      <div className="geojson-metadata-panel-content">
        <div className="introduction-text content-padding">{introText}</div>
        <div className="metadata-form-container content-padding">
          {formComponent}
        </div>
        {showDangerZone && (
          <div className="danger-zone-container">{dangerZoneComponent}</div>
        )}
      </div>
      <div className="footer-container">
        {submitButton}
        <CustomButton
          className="discard-button"
          onClick={handleCloseClick}
          type="discard"
        >
          <VkfIcon name="discard" />
          {translate("geojson-cancel-btn")}
        </CustomButton>
      </div>
    </div>
  );
};

MetadataPanel.propTypes = {
  introText: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  showDangerZone: PropTypes.bool.isRequired,
  formComponent: PropTypes.element.isRequired,
  dangerZoneComponent: PropTypes.element.isRequired,
  submitButton: PropTypes.element.isRequired,
};

export default MetadataPanel;
