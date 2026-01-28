/**
 * Created by jacob.mendt@pikobytes.de on 07.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { translate } from "@util/util";
import Modal from "@components/Modal";
import FormAddWms from "./forms/FormAddWms";
import "./DialogAddWms.scss";
import { useResetSelectableLayers } from "./forms/atoms";

export const DialogAddWms = (props) => {
  const { onClose, onSubmit } = props;
  const resetSelectableLayers = useResetSelectableLayers();

  const handleClose = useCallback(() => {
    resetSelectableLayers();
    onClose();
  }, [onClose, resetSelectableLayers]);

  const handleSubmit = (selectedLayerId) => {
    onSubmit(selectedLayerId);
    handleClose();
  };

  return (
    <Modal
      title={translate("control-basemapselector-addwms-title")}
      modalClassName="vkf-dialog-addwms"
      isOpen={true}
      onClose={handleClose}
      renderContent={() => (
        <FormAddWms onSubmit={handleSubmit} onClose={handleClose} />
      )}
    />
  );
};

DialogAddWms.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default DialogAddWms;
