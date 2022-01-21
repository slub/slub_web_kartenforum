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
    <div className="vkf-loading-indicator">
      <svg
        className="loading-icon"
        version="1.1"
        id="Layer_1"
        x="0"
        y="0"
        viewBox="0 0 70 100"
      >
        <rect
          fill="white"
          width="5"
          height="100"
          transform="translate(0) rotate(180 3 50)"
        >
          <animate
            attributeName="height"
            attributeType="XML"
            dur="1s"
            values="30; 100; 30"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y"
            attributeType="XML"
            dur="1.2s"
            values="0;60;0"
            repeatCount="indefinite"
          />
        </rect>
        <rect
          x="17"
          fill="white"
          width="5"
          height="100"
          transform="translate(0) rotate(180 20 50)"
        >
          <animate
            attributeName="height"
            attributeType="XML"
            dur="1s"
            values="30; 100; 30"
            repeatCount="indefinite"
            begin="0.1s"
          />
          <animate
            attributeName="y"
            attributeType="XML"
            dur=".5s"
            values="0;5;0"
            repeatCount="indefinite"
          />
        </rect>
        <rect
          x="40"
          fill="white"
          width="5"
          height="100"
          transform="translate(0) rotate(180 40 50)"
        >
          <animate
            attributeName="height"
            attributeType="XML"
            dur="1s"
            values="30; 100; 30"
            repeatCount="indefinite"
            begin="0.3s"
          />
          <animate
            attributeName="y"
            attributeType="XML"
            dur="2s"
            values="0;30;0"
            repeatCount="indefinite"
            begin="0.6s"
          />
        </rect>
        <rect
          x="60"
          fill="white"
          width="5"
          height="100"
          transform="translate(0) rotate(180 58 50)"
        >
          <animate
            attributeName="height"
            attributeType="XML"
            dur="1s"
            values="30; 100; 30"
            repeatCount="indefinite"
            begin="0.5s"
          />
          <animate
            attributeName="y"
            attributeType="XML"
            dur="1s"
            values="0;60;0"
            repeatCount="indefinite"
            begin=".3s"
          />
        </rect>
      </svg>
      <div className="loading-text">Loading…</div>
    </div>
  );
};

export default LoadingBar;
