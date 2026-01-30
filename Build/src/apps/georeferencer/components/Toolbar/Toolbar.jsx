/**
 * Created by jacob.mendt@pikobytes.de on 10.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState, useRef, useEffect } from "react";
import { useRecoilValue, useSetRecoilState, useRecoilState } from "recoil";
import queryString from "query-string";
import {
  postTransformation,
  queryTransformationPreview,
  queryTransformationTry,
} from "@util/apiGeo";
import { isDefined, translate } from "@util/util";
import { notificationState } from "@atoms";
import {
  isLoadingState,
  rectifiedImageParamsState,
  sourceViewParamsState,
  targetViewParamsState,
  transformationState,
} from "@georeferencer/atoms";
import ControlButton from "@georeferencer/components/ControlButton";
import ControlDropDown from "@georeferencer/components/ControlDropDown";
import DialogConfirm from "@georeferencer/components/DialogConfirm";
import { usePrevious } from "@util/hooks";
import { Controller } from "./Controller";
import { activateZoomPanAction } from "./actions";
import { Glyphicon } from "react-bootstrap";

import "./Toolbar.scss";

const ID_CONTROLS = {
  ZOOM_PAN: "control-zoom-pan",
  ADD_GCP: "control-add-gcp",
  MOVE_GCP: "control-move-gcp",
  DEL_GCP: "control-del-gcp",
  DRAW_CLIP: "control-draw-clip",
};

const ID_TRANSFORMATIONS = {
  AFFINE: "affine",
  POLYNOM: "polynom",
  TPS: "tps",
};

function getDropDownOptions() {
  return [
    {
      id: ID_CONTROLS.ADD_GCP,
      title: translate("georef-setgcp"),
      iconClassName: "icon-point-add",
    },
    {
      id: ID_CONTROLS.MOVE_GCP,
      title: translate("georef-movegcp"),
      iconClassName: "icon-point-move",
    },
    {
      id: ID_CONTROLS.DEL_GCP,
      title: translate("georef-delgcp"),
      iconClassName: "icon-point-remove",
    },
  ];
}

function getTransformationOptions() {
  return [
    {
      id: ID_TRANSFORMATIONS.AFFINE,
      title: "Affine",
      iconClassName: "icon-layercalc",
    },
    {
      id: ID_TRANSFORMATIONS.POLYNOM,
      title: "Polynom",
      iconClassName: "icon-layercalc",
    },
    {
      id: ID_TRANSFORMATIONS.TPS,
      title: "TPS",
      iconClassName: "icon-layercalc",
    },
  ];
}

export const Toolbar = () => {
  const transformation = useRecoilValue(transformationState);
  const sourceViewParams = useRecoilValue(sourceViewParamsState);
  const targetViewParams = useRecoilValue(targetViewParamsState);
  const setNotification = useSetRecoilState(notificationState);
  const setRectifiedImageParams = useSetRecoilState(rectifiedImageParamsState);
  const [isLoading, setIsLoading] = useRecoilState(isLoadingState);
  const [pendingParams, setPendingParams] = useState(null);
  const [activeControl, setActiveControl] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const prevActiveControl = usePrevious(activeControl);
  const [selectedAlgorithm, setActiveAlgorithm] = useState(
    ID_TRANSFORMATIONS.AFFINE
  );

  // Ref for the gcp controller
  const refController = useRef(null);

  // Define options
  const dropdownOptions = getDropDownOptions();
  const transformationOptions = getTransformationOptions();

  // Handle click control
  const handleClickControl = (newActiveControl) => {
    setActiveControl(newActiveControl);
  };

  // Handle click Transformation
  const handleSelectAlgorithm = (newTransformation) => {
    setActiveAlgorithm(newTransformation);
  };

  // Handle get rectified image
  const handleClickRectifiedImage = async () => {
    const fetchData = async (map_id, params) => {
      const rectifiedImageParams =
        refController.current.hasParamsOrClipChanged() ||
        selectedAlgorithm !== transformation.params.algorithm ||
        transformation?.overwrites === undefined ||
        transformation.overwrites === 0
          ? await queryTransformationTry(map_id, params)
          : await queryTransformationPreview(transformation.overwrites);
      setRectifiedImageParams(rectifiedImageParams);
    };

    if (isLoading) {
      return;
    }

    const newParams = Object.assign(refController.current.getParams(), {
      algorithm: selectedAlgorithm,
    });

    if (newParams.gcps.length < 4) {
      setNotification({
        id: "toolbar-info",
        type: "warning",
        text: translate("georef-confirm-warn-gcp"),
      });

      return;
    }

    setIsLoading(true);

    try {
      await fetchData(transformation.map_id, newParams);
    } catch (error) {
      setNotification({
        id: "toolbar-info",
        type: "danger",
        text: error.message,
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle get rectified image
  const handleClickConfirm = () => {
    if (refController.current !== null) {
      const newParams = {
        clip: refController.current.getClip(),
        params: Object.assign(refController.current.getParams(), {
          algorithm: selectedAlgorithm,
        }),
        overwrites: transformation.overwrites,
      };

      if (newParams.params.gcps.length < 4) {
        setNotification({
          id: "toolbar-info",
          type: "warning",
          text: translate("georef-confirm-warn-gcp"),
        });
      } else {
        setPendingParams({
          map_id: transformation.map_id,
          params: newParams,
        });
      }
    }
  };

  // Handle confirm
  const handleConfirm = async () => {
    if (!isDefined(pendingParams)) {
      return;
    }

    const confirmData = async (map_id, params) => {
      const response = await postTransformation(map_id, params);

      // handle error cases
      if (isDefined(response.error_code)) {
        throw new Error(response.error_message);
      }

      // If there is redirect path set use it and if not redirect to main
      const qs = queryString.parse(location.search);
      const path = qs.redirect !== undefined ? qs.redirect : "/";
      window.location.href = `${window.location.origin}${path}`;
    };

    try {
      setIsLoading(true);
      setPendingParams(null);
      await confirmData(pendingParams.map_id, pendingParams.params);
    } catch (error) {
      setNotification({
        id: "toolbar-info",
        type: "danger",
        text: error.message,
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveClip = () => {
    handleClickControl();
    if (!isDefined(refController.current)) {
      return;
    }

    refController.current.removeClip();
  };

  // Effect for initializing the gcp controller
  useEffect(() => {
    if (
      transformation !== null &&
      refController.current === null &&
      sourceViewParams !== null &&
      targetViewParams !== null
    ) {
      refController.current = new Controller({
        clip:
          transformation?.clip !== undefined && transformation?.clip !== null
            ? {
                type: transformation.clip.type,
                coordinates: transformation.clip.coordinates,
              }
            : undefined,
        onSetHelperMsg: (newHelperMsg) => {
          setNotification({
            id: "toolbar-info",
            type: "info",
            text: newHelperMsg,
          });
        },
        params: {
          algorithm: transformation.params.algorithm,
          gcps: transformation.params.gcps,
        },
        sourceMap: sourceViewParams.map,
        targetMap: targetViewParams.map,
      });

      // Set the zoom pan action as active
      setActiveControl(ID_CONTROLS.ZOOM_PAN);
      setActiveAction(
        activateZoomPanAction(
          sourceViewParams.map,
          targetViewParams.map,
          () => {}
        )
      );

      // restore algorithm setting from transformation
      setActiveAlgorithm(transformation.params.algorithm);
    }
  }, [
    transformation,
    sourceViewParams,
    targetViewParams,
    setActiveControl,
    setActiveAction,
    setNotification,
  ]);

  // Effect for updating the map behavior in case of changing of the active control
  useEffect(() => {
    if (activeAction !== undefined && activeControl !== prevActiveControl) {
      if (activeControl === ID_CONTROLS.ZOOM_PAN) {
        setActiveAction(
          activateZoomPanAction(
            sourceViewParams.map,
            targetViewParams.map,
            activeAction.disable
          )
        );
      } else if (
        refController.current !== null &&
        activeControl === ID_CONTROLS.ADD_GCP
      ) {
        setActiveAction(
          refController.current.activateAddAction(activeAction.disable)
        );
      } else if (
        refController.current !== null &&
        activeControl === ID_CONTROLS.MOVE_GCP
      ) {
        setActiveAction(
          refController.current.activateMoveAction(activeAction.disable)
        );
      } else if (
        refController.current !== null &&
        activeControl === ID_CONTROLS.DEL_GCP
      ) {
        setActiveAction(
          refController.current.activateDelAction(activeAction.disable)
        );
      } else if (
        refController.current !== null &&
        activeControl === ID_CONTROLS.DRAW_CLIP
      ) {
        setActiveAction(
          refController.current.activateDrawClipAction(activeAction.disable)
        );
      } else {
        activeAction.disable();
      }
    }
  }, [activeControl, prevActiveControl, activeAction, setActiveAction]);

  return (
    <div className="vk-georeference-toolbar">
      <div>
        <ControlButton
          activeControl={activeControl}
          id={ID_CONTROLS.ZOOM_PAN}
          iconClassName="icon-move"
          onClick={handleClickControl}
          title={translate("georef-movemap")}
        />
        <ControlDropDown
          id="control-toggle-gcp-action"
          activeControl={activeControl}
          defaultTitle={translate("georef-editgcp")}
          options={dropdownOptions}
          onClick={handleClickControl}
          parentIconClassName="icon-points"
        />
        <ControlButton
          activeControl={activeControl}
          id={ID_CONTROLS.DRAW_CLIP}
          iconClassName="icon-draw"
          onClick={handleClickControl}
          title={translate("georef-drawclip")}
        />
        <ControlButton
          id={"remove-clip"}
          iconClassName="remove"
          onClick={handleRemoveClip}
          title={translate("georef-removeclip")}
          IconComponent={Glyphicon}
        />
      </div>

      <div>
        <ControlDropDown
          id="control-toggle-transformation"
          activeControl={selectedAlgorithm}
          className="control-toggle-transformations"
          parentIconClassName="icon-layercalc"
          disableActiveBehavior={true}
          options={transformationOptions}
          onClick={handleSelectAlgorithm}
        />
        <ControlButton
          id="get-rectified-image"
          iconClassName="icon-reload"
          onClick={handleClickRectifiedImage}
          title={translate("georef-validate")}
        />
        <ControlButton
          id="confirm-rectified-image"
          iconClassName="icon-save"
          className="save"
          onClick={handleClickConfirm}
          title={translate("georef-confirm")}
        />
      </div>

      {pendingParams !== null && (
        <DialogConfirm
          onClose={() => setPendingParams(null)}
          onSubmit={handleConfirm}
        />
      )}
    </div>
  );
};

export default Toolbar;
