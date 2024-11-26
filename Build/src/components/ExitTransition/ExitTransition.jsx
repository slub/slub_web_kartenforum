/*
 * Created by tom.schulze@pikobytes.de on 25.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import clsx from "clsx";
import PropTypes from "prop-types";
import React, { useCallback, useRef, useState } from "react";

import { isDefined } from "@util/util";

/**
 * ExitTransitionProps
 * @typedef {Object} ExitTransitionProps
 * @property {string} className The class name of the container element handling the transitions.
 * @property {function} Component The actual React component receiving the props.
 * @property {object} props The props passed on to Component.
 */

/**
 * A wrapper to handle exit transitions. It helps unmounting components by providing "keepAliveProps" until the exit transition finishes.
 *
 * @param {ExitTransitionProps} props The component's props.
 *
 * @returns
 */
const ExitTransition = ({ className, Component, props }) => {
  const [keepAliveProps, setKeepAliveProps] = useState(props);
  const previousProps = useRef(props);

  // Update previousProps when props change
  if (props !== null) {
    previousProps.current = props;
  }

  // If props are null, prepare unmount
  if (
    props === null &&
    previousProps.current !== null &&
    keepAliveProps === null
  ) {
    setKeepAliveProps(previousProps.current);
  }

  // Finally unmount the component
  const handleExitTransitionEnd = useCallback(() => {
    setKeepAliveProps(null);
  }, []);

  return (
    <div
      onTransitionEnd={handleExitTransitionEnd}
      className={clsx(className, props !== null && "in")}
    >
      {(props !== null || keepAliveProps !== null) && isDefined(Component) && (
        <Component {...(props === null ? keepAliveProps : props)} />
      )}
    </div>
  );
};

ExitTransition.propTypes = {
  className: PropTypes.string.isRequired,
  Component: PropTypes.func.isRequired,
  props: PropTypes.object.isRequired,
};

export default ExitTransition;
