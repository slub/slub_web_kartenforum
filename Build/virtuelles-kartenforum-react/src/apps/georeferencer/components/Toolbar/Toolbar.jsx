/**
 * Created by jacob.mendt@pikobytes.de on 10.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState, useRef, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { translate } from "../../../../util/util";
import {
  sourceViewParamsState,
  targetViewParamsState,
  transformationState,
} from "../../atoms/atoms";
import ControlButton from "../ControlButton/ControlButton";
import ControlDropDown from "../ControlDropDown/ControlDropDown";
import { ControllerGcps } from "../../util/controllerGcps";
import "./Toolbar.scss";

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

function getDropDownOptions() {
  return [
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
}

function getTransformationOptions() {
  return [
    { id: ID_TRANSFORMATIONS.AFFINE, title: "Affine", iconClassName: "" },
    { id: ID_TRANSFORMATIONS.POLYNOM, title: "Polynom", iconClassName: "" },
    { id: ID_TRANSFORMATIONS.TPS, title: "TPS", iconClassName: "" },
  ];
}

export const Toolbar = () => {
  const transformation = useRecoilValue(transformationState);
  const sourceViewParams = useRecoilValue(sourceViewParamsState);
  const targetViewParams = useRecoilValue(targetViewParamsState);
  const [activeControl, setActiveControl] = useState(null);
  const [activeTransformation, setActiveTransformation] = useState(
    ID_TRANSFORMATIONS.AFFINE
  );

  // Ref for the gcp controller
  const refControllerGcp = useRef(null);

  // Define options
  const dropdownOptions = getDropDownOptions();
  const transformationOptions = getTransformationOptions();

  // Handle click control
  const handleClickControl = (newActiveControl) => {
    setActiveControl(newActiveControl);
  };

  // Handle click Transformation
  const handeClickTransformation = (newTransformation) => {
    setActiveTransformation(newTransformation);
  };

  // Effect for initializing the gcp controller
  useEffect(() => {
    if (
      refControllerGcp.current === null &&
      sourceViewParams !== null &&
      targetViewParams !== null
    ) {
      refControllerGcp.current = new ControllerGcps({
        params: transformation.params,
        sourceMap: sourceViewParams.map,
        targetMap: targetViewParams.map,
      });
    }
  }, [transformation, sourceViewParams, targetViewParams]);

  return (
    <div className="vk-georeference-toolbar">
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

export default Toolbar;
