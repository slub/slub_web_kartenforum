/*
 * Created by tom.schulze@pikobytes.de on 22.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import PropTypes from "prop-types";
import React, { useCallback, useMemo, useState } from "react";

import { translate } from "@util/util";

import CustomButton from "@map/components/GeoJson/components/CustomButton";
import VkfIcon from "@components/VkfIcon";

import CloseHorizontalModeModal from "@map/components/GeoJson/GeoJsonControlBar/components/CloseHorizontalModeModal";

import "./GeoJsonControlBar.scss";

const MODAL_STATE = {
  NONE: 0,
  DISCARD: 1,
};

const GeoJsonControlBar = ({
  title,
  onSave = () => Promise.resolve(),
  onDiscard = () => null,
  controls,
  content,
  isSaveButtonDisabled,
}) => {
  const [loading, setLoadingState] = useState(false);
  const [modalState, setModalState] = useState(MODAL_STATE.NONE);
  const formattedLayerTitle = useMemo(() => {
    const validatedTitle = title ?? "";

    if (validatedTitle === "") {
      return `[${translate("geojson-featureview-no-title")}]`;
    }

    return validatedTitle;
  }, [title]);

  const handleModalClose = useCallback(() => {
    setModalState(MODAL_STATE.NONE);
  }, []);

  const handleSave = useCallback(() => {
    setLoadingState(true);
    return onSave().finally(() => setLoadingState(false));
  }, [onSave]);

  const handleDiscard = useCallback(() => {
    onDiscard();
    handleModalClose();
  }, [onDiscard]);

  const handleDiscardClick = useCallback(() => {
    setModalState(MODAL_STATE.DISCARD);
  }, []);

  return (
    <div className="vkf-geojson-control-bar-root">
      <div className="control-bar-header">
        <div className="control-bar-title">{formattedLayerTitle}</div>
        <div className="control-bar-layer-buttons">{controls}</div>
      </div>
      <div className="control-bar-main">
        <div className="control-bar-content">{content}</div>
      </div>
      <div className="control-bar-footer">
        <CustomButton
          className="discard-button"
          onClick={handleDiscardClick}
          type="discard"
        >
          <VkfIcon name="discard" />
          {translate("geojson-cancel-btn")}
        </CustomButton>
        <CustomButton
          disabled={isSaveButtonDisabled}
          className="save-button"
          onClick={handleSave}
          loading={loading}
          type="save"
        >
          <VkfIcon name="save" />
          {translate("geojson-save-btn")}
        </CustomButton>
      </div>
      <CloseHorizontalModeModal
        show={modalState === MODAL_STATE.DISCARD}
        onSave={handleSave}
        onDiscard={handleDiscard}
        onClose={handleModalClose}
      />
    </div>
  );
};

GeoJsonControlBar.propTypes = {
  title: PropTypes.string,
  onSave: PropTypes.func,
  onDiscard: PropTypes.func,
  content: PropTypes.element.isRequired,
  controls: PropTypes.element.isRequired,
  isSaveButtonDisabled: PropTypes.bool,
};

export default GeoJsonControlBar;
