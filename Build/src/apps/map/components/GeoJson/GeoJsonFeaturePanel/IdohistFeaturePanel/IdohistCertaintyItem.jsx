/*
 * Created by tom.schulze@pikobytes.de on 27.06.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React from "react";
import PropTypes from "prop-types";

const IdohistCertaintyItem = ({ label, value = 0 }) => {
  return (
    <div className="certainty-item">
      <span className="certainty-label">{label}: </span>
      <span className="value">{`${value * 100}%`}</span>
      <div className="bar">
        <div className="track"></div>
        <div className="value" style={{ width: `${value * 100}%` }}></div>
      </div>
    </div>
  );
};

IdohistCertaintyItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
};

export default IdohistCertaintyItem;
