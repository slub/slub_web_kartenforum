/**
 * Created by nicolas.looschen@pikobytes.de on 10/3/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import PropTypes from "prop-types";
import { useRecoilValue } from "recoil";
import clsx from "clsx";

import { translate } from "../../../../../../util/util";
import { facetState } from "../../../../atoms/atoms";
import "./ToggleFacetsButton.scss";

export const ToggleFacetsButton = ({ onClick, isOpen }) => {
  const facets = useRecoilValue(facetState);

  return (
    <button
      className={clsx(
        "vkf-toggle-facets",
        facets.facets.length > 0 && "active"
      )}
      onClick={onClick}
      title={translate(`mapsearch-facetedsearch-${isOpen ? "close" : "open"}`)}
    />
  );
};

ToggleFacetsButton.propTypes = {
  isOpen: PropTypes.bool,
  onClick: PropTypes.func,
};

export default ToggleFacetsButton;
