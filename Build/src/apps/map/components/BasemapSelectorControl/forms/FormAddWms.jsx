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

import "./FormAddWms.scss";
import { translate } from "@util/util";

const FormAddWms = ({ onSubmit, onClose }) => {
  return (
    <div className="form-add-wms-root">
      <div className="form-description">
        <div>
          {translate("control-basemapselector-addwms-input-description")}
        </div>
        <div>
          {translate("control-basemapselector-addwms-select-description")}
        </div>
      </div>
      <FormParseCapabilities />
      <FormSelectWmsLayer onSubmit={onSubmit} onClose={onClose} />
    </div>
  );
};

FormAddWms.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FormAddWms;
