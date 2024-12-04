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
 * @property {object|null} props The props passed on to Component. Can be null to signal the start of the exit transition.
 */

/**
 * A wrapper to handle exit transitions. It helps unmounting components by providing "keepAliveProps" until the exit transition finishes.
 *
 * @param {ExitTransitionProps} props The component's props.
 *
 * @returns
 */
const ExitTransition = ({ className, Component, props, onExit }) => {
  const prevProps = useRef(props);
  const [component, setComponent] = useState(null);

  const arePropsDefined = isDefined(props);

  // Update previousProps when props change
  if (arePropsDefined && prevProps.current !== props) {
    setComponent(<Component {...props} />);
    prevProps.current = props;
  }

  // Finally unmount the component
  const handleExitTransitionEnd = useCallback(() => {
    if (!arePropsDefined) {
      prevProps.current = null;
      setComponent(null);
      onExit && onExit();
    }
  }, [arePropsDefined, onExit]);

  return (
    <div
      onTransitionEnd={handleExitTransitionEnd}
      className={clsx(className, props !== null && "in")}
    >
      {component}
    </div>
  );
};

ExitTransition.propTypes = {
  className: PropTypes.string.isRequired,
  Component: PropTypes.func.isRequired,
  props: PropTypes.object,
  onExit: PropTypes.func,
};

ExitTransition.defaultPropTypes = {
  props: null,
};

export default ExitTransition;
