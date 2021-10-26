/**
 * Created by nicolas.looschen@pikobytes.de on 26/10/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { useRecoilValue } from "recoil";
import { map3dState } from "../../atoms/atoms";
import { useEffect } from "react";

export const StyleAppender = () => {
  const is3d = useRecoilValue(map3dState);

  useEffect(() => {
    const el = document.getElementById("vk2MapPanel");

    const containerElements = document.getElementsByClassName(
      "olcs-hideoverlay"
    );

    if (is3d) {
      // Remove 3d-mode from map container
      el.classList.remove("mode-3d");
      // remove olcs overlay modification
      for (let containerEl of containerElements) {
        containerEl.classList.remove("olcs-hideoverlay");
      }
    } else {
      if (!el.classList.contains("mode-3d")) {
        el.classList.add("mode-3d");
      }
    }
  }, [is3d]);

  return <></>;
};

export default StyleAppender;
