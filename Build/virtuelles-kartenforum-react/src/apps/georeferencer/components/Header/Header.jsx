/**
 * Created by jacob.mendt@pikobytes.de on 10.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState } from "react";
import PropTypes from "prop-types";
import ControlButton from "../ControlButton/ControlButton";
import ControlDropDown from "../ControlDropDown/ControlDropDown";
import { translate } from "../../../../util/util";
import "./Header.scss";

const ID_CONTROLS = {
  ZOOM_PAN: "control-zoom-pan",
  ADD_GCP: "control-add-gcp",
  MOVE_GCP: "control-move-gcp",
  DEL_GCP: "control-del-gcp",
  DRAW_CLIP: "control-draw-clip",
};

const ID_TRANSFORMATIONS = {
  AFFINE: "affine",
  POLYNOM: "polynom",
  TPS: "tps",
};

export const Header = (props) => {
  const { children } = props;
  const [activeControl, setActiveControl] = useState(null);
  const [activeTransformation, setActiveTransformation] = useState(
    ID_TRANSFORMATIONS.AFFINE
  );

  const dropdownOptions = [
    {
      id: ID_CONTROLS.ADD_GCP,
      title: translate("georef-setgcp"),
      iconClassName: "icon-add-gcp",
    },
    {
      id: ID_CONTROLS.MOVE_GCP,
      title: translate("georef-movegcp"),
      iconClassName: "icon-move-gcp",
    },
    {
      id: ID_CONTROLS.DEL_GCP,
      title: translate("georef-delgcp"),
      iconClassName: "icon-del-gcp",
    },
  ];
  const transformationOptions = [
    { id: ID_TRANSFORMATIONS.AFFINE, title: "Affine", iconClassName: "" },
    { id: ID_TRANSFORMATIONS.POLYNOM, title: "Polynom", iconClassName: "" },
    { id: ID_TRANSFORMATIONS.TPS, title: "TPS", iconClassName: "" },
  ];

  // Handle click control
  const handleClickControl = (newActiveControl) => {
    setActiveControl(newActiveControl);
  };

  // Handle click Transformation
  const handeClickTransformation = (newTransformation) => {
    setActiveTransformation(newTransformation);
  };

  return (
    <div className="vk-header-app-georeference">
      <div>
        <ControlButton
          activeControl={activeControl}
          id={ID_CONTROLS.ZOOM_PAN}
          iconClassName="icon-zoom-pan"
          onClick={handleClickControl}
          title={translate("georef-movemap")}
        />
        <ControlDropDown
          activeControl={activeControl}
          defaultTitle={translate("georef-editgcp")}
          options={dropdownOptions}
          onClick={handleClickControl}
        />
        <ControlButton
          activeControl={activeControl}
          id={ID_CONTROLS.DRAW_CLIP}
          iconClassName="icon-add-gcp"
          onClick={handleClickControl}
          title={translate("georef-drawclip")}
        />
      </div>

      <div>
        <ControlDropDown
          activeControl={activeTransformation}
          className="control-toggle-transformations"
          disableActiveBehavior={true}
          options={transformationOptions}
          onClick={handeClickTransformation}
          toggleIcon={
            <a
              data-classes="faq"
              className="vk2-modal-anchor"
              title="Frequently Asked Questions (FAQ)"
              href="/vkviewer/static/faq/#georeferencing-of-maps-algorithm"
              target="_blank"
            >
              <span
                className="glyphicon glyphicon-info-sign"
                aria-hidden="true"
              ></span>
            </a>
          }
        />
      </div>
    </div>
  );
};

Header.propTypes = {
  children: PropTypes.node,
};

export default Header;
