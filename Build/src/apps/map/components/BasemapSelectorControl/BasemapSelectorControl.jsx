/**
 * Created by nicolas.looschen@pikobytes.de on 10.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { Fragment } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import BasemapSelectorDialog from "./BasemapSelectorDialog.jsx";
import { BASEMAP_SELECTOR_CONTROL_ID } from "../Controls/BasemapSelectorControl.jsx";
import useControlContainer from "../../hooks/useControlContainer.js";
import { translate } from "../../../../util/util";
import { ActiveDialog } from "../VkfMap/constants.js";

export const BasemapSelectorControl = () => {
  const { baseMapControlEl, activeDialog, toggleDialog, dialogRef } =
    useControlContainer(
      BASEMAP_SELECTOR_CONTROL_ID,
      ActiveDialog.BasemapSelector
    );

  return baseMapControlEl !== null
    ? createPortal(
        <div ref={dialogRef}>
          <button
            onClick={toggleDialog}
            title={translate("control-basemapselector-open")}
            className={clsx(
              "maplibregl-ctrl-basemap-selector",
              activeDialog === ActiveDialog.BasemapSelector && "active"
            )}
          ></button>
          {activeDialog === ActiveDialog.BasemapSelector && (
            <div
              className={clsx(
                "basemap-selector-modal",
                activeDialog === ActiveDialog.BasemapSelector && "active"
              )}
            >
              <BasemapSelectorDialog />
            </div>
          )}
        </div>,
        baseMapControlEl
      )
    : null;
};

export default BasemapSelectorControl;
