/*
 * Created by tom.schulze@pikobytes.de on 16.10.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React from "react";

import PropTypes from "prop-types";

import "./GeoJsonLayerEditPanel.scss";

const GeoJsonEditPanel = ({ className }) => {
  return (
    <div className={className}>
      <div className="content">
        <pre>
          {`  /\\_/\\
 ( o.o )
  > ^ <
`}
        </pre>
      </div>
    </div>
  );
};

GeoJsonEditPanel.propTypes = {
  className: PropTypes.string,
};

export default GeoJsonEditPanel;
