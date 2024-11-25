/*
 * Created by tom.schulze@pikobytes.de on 25.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import clsx from "clsx";
import PropTypes from "prop-types";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { isDefined } from "@util/util";

/**
 * WithExitTransitionProps
 * @typedef {Object} WithExitTransitionProps
 * @property {string} className The class name of the container element handling the transitions.
 * @property {function} Component The actual React component receiving the props.
 * @property {object} props The props passed on to Component.
 */

/**
 * A wrapper to handle exit transitions. It helps unmounting components by providing "keepAliveProps" until the exit transition finishes.
 *
 * @param {WithExitTransitionProps} props The component's props.
 *
 * @returns
 */
const WithExitTransition = ({ className, Component, props }) => {
  const [isReadyToUnmount, setIsReadyToUnmount] = useState(false);

  const previousGeojsonProps = useRef(null);

  const keepAliveProps = useMemo(() => {
    if (props === null) {
      return previousGeojsonProps.current;
    }

    return props;
  }, [props]);

  const handleExitTransitionEnd = useCallback(() => {
    const exitTransitionCondition = props === null;
    if (exitTransitionCondition) {
      setIsReadyToUnmount(true);
      setIsReadyToUnmount(false);
    }
  }, [props]);

  useEffect(() => {
    previousGeojsonProps.current = props;
  }, [props]);

  return (
    <div
      onTransitionEnd={handleExitTransitionEnd}
      className={clsx(className, props !== null && "in")}
    >
      {!isReadyToUnmount &&
        isDefined(keepAliveProps) &&
        isDefined(Component) && <Component {...keepAliveProps} />}
    </div>
  );
};

WithExitTransition.propTypes = {
  className: PropTypes.string.isRequired,
  Component: PropTypes.func,
  props: PropTypes.object,
};

export default WithExitTransition;
