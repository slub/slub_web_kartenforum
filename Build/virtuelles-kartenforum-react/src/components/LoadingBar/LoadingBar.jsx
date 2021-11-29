/**
 * Created by jacob.mendt@pikobytes.de on 22.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import "./LoadingBar.scss";

export const LoadingBar = () => {
  return (
    <div className="vkf-loading-bar-panel">
      <div>
        <div className="progress">
          <div
            className="progress-bar progress-bar-striped active"
            role="progressbar"
            aria-valuenow="100"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <span className="sr-only">100% Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingBar;
