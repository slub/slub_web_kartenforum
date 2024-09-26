/**
 * Created by nicolas.looschen@pikobytes.de on 11.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import PermalinkExporterTabs from "./PermalinkExporterTabs.jsx";
import { PERMALINK_CONTROL_ID } from "../../../Controls/PermalinkControl.jsx";
import { translate } from "../../../../../../util/util.js";
import useControlContainer from "../../../../hooks/useControlContainer.js";
import { ActiveDialog } from "../../../VkfMap/constants.js";

export const PermalinkExporter = () => {
  const { baseMapControlEl, activeDialog, toggleDialog, dialogRef } =
    useControlContainer(PERMALINK_CONTROL_ID, ActiveDialog.Permalink);

  return baseMapControlEl !== null
    ? createPortal(
        <div ref={dialogRef}>
          <button
            className={clsx(
              "maplibregl-ctrl-permalink",
              activeDialog === ActiveDialog.Permalink && "active"
            )}
            onClick={toggleDialog}
            title={translate("control-permalink-open")}
          ></button>
          {activeDialog === ActiveDialog.Permalink && (
            <div className="content-container">
              <PermalinkExporterTabs />
            </div>
          )}
        </div>,
        baseMapControlEl
      )
    : null;
};

export default PermalinkExporter;
