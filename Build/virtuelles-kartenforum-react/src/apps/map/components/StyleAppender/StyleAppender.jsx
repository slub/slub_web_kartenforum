/**
 * Created by nicolas.looschen@pikobytes.de on 26/10/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { map3dState, mapState } from "../../atoms/atoms";
import { TERRAIN_ATTRIBUTION_ID } from "../MapWrapper/components/CustomAttribution";
import { isDefined } from "../../../../util/util";

/**
 * Handles some styling issues by updating styles where the global state is not available
 * @returns {JSX.Element}
 * @constructor
 */
export const StyleAppender = () => {
  const is3d = useRecoilValue(map3dState);
  const map = useRecoilValue(mapState);

  // remove olcs-hideoverlay which hides the open layer controls
  useEffect(() => {
    const containerElements =
      document.getElementsByClassName("olcs-hideoverlay");

    if (is3d) {
      // remove olcs overlay modification
      for (let containerEl of containerElements) {
        containerEl.classList.remove("olcs-hideoverlay");
      }
    }
  }, [is3d]);

  // add mode-3d class to root container in order to apply legacy styles
  useEffect(() => {
    const el = document.getElementById("vk2MapPanel");

    if (is3d) {
      // Remove 3d-mode from map container
      el.classList.add("mode-3d");
    } else {
      el.classList.remove("mode-3d");
    }
  }, [is3d]);

  // hide/unhide terrain attribution on mode change
  useEffect(() => {
    const attributionEl = document.getElementById(TERRAIN_ATTRIBUTION_ID);

    if (isDefined(attributionEl)) {
      if (is3d) {
        attributionEl.style.display = "";
      } else {
        attributionEl.setAttribute("style", "display:none !important");
      }
    }
  }, [is3d, map]);

  return <></>;
};

export default StyleAppender;
