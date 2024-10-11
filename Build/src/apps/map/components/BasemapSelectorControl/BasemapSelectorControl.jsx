/**
 * Created by nicolas.looschen@pikobytes.de on 10.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import useControlContainer from "@map/hooks/useControlContainer.js";
import { translate } from "@util/util";
import { BASEMAP_SELECTOR_CONTROL_ID } from "@map/components/Controls/BasemapSelectorControl.jsx";
import { ActiveDialog } from "@map/components/VkfMap/constants.js";
import BasemapSelectorDialog from "./BasemapSelectorDialog.jsx";

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
