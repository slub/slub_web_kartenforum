/**
 * Created by nicolas.looschen@pikobytes.de on 10.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { mapState } from "../../atoms/atoms.js";
import { isDefined, translate } from "../../../../util/util.js";
import customEvents from "../MapWrapper/customEvents.js";
import { BASEMAP_SELECTOR_CONTROL_ID } from "../Controls/BasemapSelectorControl.jsx";
import { createPortal } from "react-dom";
import BasemapSelectorDialog from "./BasemapSelectorDialog.jsx";

export const BasemapSelectorControl = () => {
  const map = useRecoilValue(mapState);

  const [baseMapControlEl, setBaseMapControlEl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isDefined(map)) {
      const handleAddControl = (e) => {
        if (e.control?.id === BASEMAP_SELECTOR_CONTROL_ID) {
          setBaseMapControlEl(e.control._container);
        }
      };

      const handleRemoveControl = (e) => {
        if (e.control?.id === BASEMAP_SELECTOR_CONTROL_ID) {
          setBaseMapControlEl(null);
        }
      };

      map.on(customEvents.controlAdded, handleAddControl);
      map.on(customEvents.controlRemoved, handleRemoveControl);
      map.on("move", () => setIsModalOpen(false));
      map.on("click", () => setIsModalOpen(false));

      return () => {
        map.off(customEvents.controlAdded, handleAddControl);
        map.off(customEvents.controlRemoved, handleRemoveControl);
      };
    }
  }, [map, isModalOpen]);

  return baseMapControlEl !== null
    ? createPortal(
        <>
          <button
            onClick={() => setIsModalOpen(!isModalOpen)}
            title={translate("control-basemapselector-open")}
          ></button>
          {isModalOpen && (
            <div
              className={`basemap-selector-modal ${
                isModalOpen ? "active" : "inactive"
              }`}
            >
              <BasemapSelectorDialog map={map} />
            </div>
          )}
        </>,
        baseMapControlEl
      )
    : null;
};

export default BasemapSelectorControl;
