/**
 * Created by nicolas.looschen@pikobytes.de on 10/3/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import PropTypes from "prop-types";

import { translate } from "../../../../../../util/util";
import "./ToggleFacetsButton.scss";

export const ToggleFacetsButton = ({ onClick, isOpen }) => {
  return (
    <button
      className="vkf-toggle-facets"
      onClick={onClick}
      title={translate(`facetedsearch-${isOpen ? "close" : "open"}`)}
    />
  );
};

ToggleFacetsButton.propTypes = {
  isOpen: PropTypes.bool,
  onClick: PropTypes.func,
};

export default ToggleFacetsButton;
