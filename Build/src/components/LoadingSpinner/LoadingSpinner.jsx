/**
 * Created by nicolas.looschen@pikobytes.de on 11.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";

import "./LoadingSpinner.scss";

export const LoadingSpinner = () => {
  return (
    <div className="lds-roller">
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </div>
  );
};

export default LoadingSpinner;
