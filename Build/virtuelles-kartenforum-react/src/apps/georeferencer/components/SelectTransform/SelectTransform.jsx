/**
 * Created by jacob.mendt@pikobytes.de on 10.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import "./SelectTransform.scss";

// Allows the selection of the transformation algorithm.
// @TODO Click on the link to the faq not working yet
export const SelectTransform = () => {
  return (
    <div class="vk-select-transform">
      <a
        data-classes="faq"
        class="vk2-modal-anchor"
        title="Frequently Asked Questions (FAQ)"
        href="/vkviewer/static/faq/#georeferencing-of-maps-algorithm"
      >
        <span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span>
      </a>
      <div class="dropdown">
        <select id="transformation-chooser" class="form-control">
          <option>Affine</option>
          <option>Polynom</option>
          <option>TPS</option>
        </select>
      </div>
    </div>
  );
};

export default SelectTransform;
