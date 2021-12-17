/**
 * Created by nicolas.looschen@pikobytes.de on 26/10/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect } from "react";
import { useRecoilValue } from "recoil";
import PropTypes from "prop-types";
import { map3dState } from "../../atoms/atoms";

/**
 * Handles some styling issues by updating styles where the global state is not available
 * @returns {JSX.Element}
 * @constructor
 */
export const StyleAppender = (props) => {
  const { mapContainerId } = props;
  const is3d = useRecoilValue(map3dState);

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
    const el = document.getElementById(mapContainerId);
    console.log(el);
    if (is3d) {
      // Remove 3d-mode from map container
      el.classList.add("mode-3d");
    } else {
      el.classList.remove("mode-3d");
    }
  }, [is3d]);

  return <></>;
};

StyleAppender.propTypes = {
  mapContainerId: PropTypes.string.isRequired,
};

export default StyleAppender;
