/**
 * Created by nicolas.looschen@pikobytes.de on 11.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useState } from "react";
import { isDefined, translate } from "../../../../../../util/util.js";
import customEvents from "../../customEvents.js";
import { useRecoilValue } from "recoil";
import { mapState } from "../../../../atoms/atoms.js";
import { createPortal } from "react-dom";
import { PERMALINK_CONTROL_ID } from "../../../Controls/PermalinkControl.jsx";
import PermalinkExporterTabs from "./PermalinkExporterTabs.jsx";
import clsx from "clsx";

export const PermalinkExporter = () => {
  const [baseMapControlEl, setBaseMapControlEl] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const map = useRecoilValue(mapState);

  useEffect(() => {
    if (isDefined(map)) {
      const handleAddControl = (e) => {
        if (e.control?.id === PERMALINK_CONTROL_ID) {
          setBaseMapControlEl(e.control._container);
        }
      };

      const handleRemoveControl = (e) => {
        if (e.control?.id === PERMALINK_CONTROL_ID) {
          setBaseMapControlEl(null);
        }
      };

      map.on(customEvents.controlAdded, handleAddControl);
      map.on(customEvents.controlRemoved, handleRemoveControl);

      return () => {
        map.off(customEvents.controlAdded, handleAddControl);
        map.off(customEvents.controlRemoved, handleRemoveControl);
      };
    }
  }, [map]);

  return baseMapControlEl !== null
    ? createPortal(
        <>
          <button
            className={clsx(isActive && "active")}
            onClick={() => {
              setIsActive((oldIsActive) => !oldIsActive);
            }}
            title={translate("control-permalink-open")}
          ></button>
          {isActive && (
            <div className="content-container">
              <PermalinkExporterTabs />
            </div>
          )}
        </>,
        baseMapControlEl
      )
    : null;
};

export default PermalinkExporter;
