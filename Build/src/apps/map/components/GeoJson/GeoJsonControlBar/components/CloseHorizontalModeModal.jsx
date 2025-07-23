/**
 * Created by pouria.rezaei@pikobytes.de on 12/10/24.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback } from "react";
import PropTypes from "prop-types";
import Modal from "@components/Modal";
import { translate } from "@util/util";
import CustomButton from "@map/components/GeoJson/components/CustomButton";

import "./CloseHorizontalModeModal.scss";

const CloseHorizontalModeModal = ({ onClose, onSave, onDiscard, show }) => {
  const handleSaveClick = useCallback(() => {
    onSave().finally(() => {
      onClose();
    });
  }, [onSave, onClose]);
  return (
    <Modal
      isOpen={show}
      title={translate("geojson-discard-modal-title")}
      modalClassName="vkf-discard-dialog"
      onClose={onClose}
      renderContent={() => (
        <>
          <p>{translate("geojson-discard-modal-description")}</p>

          <div className="discard-modal-buttons">
            <CustomButton type="discard" onClick={onDiscard}>
              {translate("geojson-discard-modal-discard-button")}
            </CustomButton>
            <CustomButton type="save" onClick={handleSaveClick}>
              {translate("geojson-discard-modal-save-button")}
            </CustomButton>
          </div>
        </>
      )}
    />
  );
};

CloseHorizontalModeModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onDiscard: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
};
export default CloseHorizontalModeModal;
