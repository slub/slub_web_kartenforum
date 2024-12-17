/*
 * Created by tom.schulze@pikobytes.de on 10.12.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { Suspense, useCallback } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Modal from "@components/Modal";
import PropTypes from "prop-types";
import { translate } from "@util/util";
import { useRefreshRolesQuery } from "../useVectorMapRolesQuery";
import GeoJsonRolesForm from "../GeoJsonRolesForm";

import ErrorFallback from "../ErrorFallback/ErrorFallback";

import "./DialogRoles.scss";

const DialogRoles = ({ show, onClose }) => {
  const refreshRolesQuery = useRefreshRolesQuery();
  const handleSubmitted = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title={translate("geojson-roles-modal-title")}
      renderContent={() => (
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={refreshRolesQuery}
        >
          <Suspense fallback={<div>Loading ...</div>}>
            <GeoJsonRolesForm
              onCancelClick={onClose}
              onSubmitted={handleSubmitted}
            />
          </Suspense>
        </ErrorBoundary>
      )}
      modalClassName="vkf-dialog-geojson-roles"
    />
  );
};

DialogRoles.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
};
export default DialogRoles;
