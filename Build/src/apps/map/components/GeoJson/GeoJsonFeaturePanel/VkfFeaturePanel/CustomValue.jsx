/*
 * Created by tom.schulze@pikobytes.de on 10.09.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React from "react";
import { isValidUrl } from "@util/util";
import PropTypes from "prop-types";

const CustomValue = ({ value }) => {
  const coercedVal = `${value}`;

  if (isValidUrl(coercedVal)) {
    return (
      <a href={coercedVal} target="_blank" rel="noreferrer">
        <p className="geojson-feature-property-link">{coercedVal}</p>
      </a>
    );
  }

  return <p className="geojson-feature-property-text">{coercedVal}</p>;
};

CustomValue.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
  ]).isRequired,
};

export default CustomValue;
