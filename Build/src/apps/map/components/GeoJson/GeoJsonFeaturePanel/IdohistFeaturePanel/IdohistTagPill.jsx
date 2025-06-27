/*
 * Created by tom.schulze@pikobytes.de on 26.06.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React from "react";
import PropTypes from "prop-types";

import "./IdohistTagPill.scss";

const IdohistTagPill = ({ value }) => {
  return (
    <div className="idohist-tag-pill-root">
      <div className="value">{value} </div>
    </div>
  );
};

IdohistTagPill.propTypes = {
  value: PropTypes.string.isRequired,

  className: PropTypes.string,
};

export default IdohistTagPill;
