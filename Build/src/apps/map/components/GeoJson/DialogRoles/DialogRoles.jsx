/*
 * Created by tom.schulze@pikobytes.de on 10.12.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useCallback } from "react";
import Modal from "@components/Modal";
import PropTypes from "prop-types";
import { translate } from "@util/util";

import GeoJsonRolesForm from "./GeoJsonRolesForm";

const DialogRoles = ({ show, onClose }) => {
  // TODO ROLES disable save click if user is not allowed
  const handleSaveClick = useCallback(() => {
    console.log("save");
    onClose();
  }, [onClose]);

  const handleCloseClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={show}
      onClose={handleCloseClick}
      title={translate("geojson-roles-modal-title")}
      renderContent={() => <GeoJsonRolesForm onSubmit={handleSaveClick} />}
      modalClassName="vkf-dialog-geojson-roles"
    />
  );
};

DialogRoles.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
};
export default DialogRoles;
