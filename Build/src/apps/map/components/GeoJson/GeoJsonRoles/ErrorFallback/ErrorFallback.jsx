/*
 * Created by tom.schulze@pikobytes.de on 17.12.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { translate } from "@util/util";
import PropTypes from "prop-types";
import React, { useEffect } from "react";

const ErrorFallback = ({ resetErrorBoundary }) => {
  useEffect(() => {
    return () => {
      resetErrorBoundary();
    };
  }, [resetErrorBoundary]);

  return <>{translate("common-errors-unexpected")}</>;
};

ErrorFallback.propTypes = {
  resetErrorBoundary: PropTypes.func.isRequired,
};

export default ErrorFallback;
