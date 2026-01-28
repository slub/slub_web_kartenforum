/*
 * Created by tom.schulze@pikobytes.de on 27.01.26.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React from "react";
import FormParseCapabilities from "./FormParseCapabilities";
import FormSelectWmsLayer from "./FormSelectWmsLayer";
import PropTypes from "prop-types";
import { useRecoilValue } from "recoil";
import { hasWmsSelectableLayersAtom } from "./atoms";

import "./FormAddWms.scss";

const FormAddWms = ({ onSubmit, onClose }) => {
  const hasValidLayers = useRecoilValue(hasWmsSelectableLayersAtom);

  return (
    <div className="form-add-wms-root">
      <FormParseCapabilities />
      {hasValidLayers && (
        <FormSelectWmsLayer onSubmit={onSubmit} onClose={onClose} />
      )}
    </div>
  );
};

FormAddWms.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FormAddWms;
