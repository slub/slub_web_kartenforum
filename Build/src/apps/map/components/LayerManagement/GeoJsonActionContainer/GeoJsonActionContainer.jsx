/**
 * Created by nicolas.looschen@pikobytes.de on 26.11.24
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import VkfIcon from "@components/VkfIcon";
import SvgIcons from "@components/SvgIcons";
import React, { useCallback } from "react";
import { useSetRecoilState } from "recoil";
import { showDropZoneState } from "@map/atoms";
import { translate } from "@util/util";
import {
  isVectorMapCreateAllowed,
  isExternalVectorMapCreateAllowed,
} from "@map/components/GeoJson/util/authorization";
import { useHorizontalDrawMode } from "@map/components/GeoJson/util/hooks/useHorizontalDrawMode";
import { useHorizontalExternalVectorMapMode } from "@map/components/GeoJson/util/hooks/useHorizontalExternalVectorMapMode";
import clsx from "clsx";

export default function GeoJsonActionContainer() {
  const { createNewVectorMap } = useHorizontalDrawMode();
  const { createNewExternalVectorMap } = useHorizontalExternalVectorMapMode();
  const setShowDropZone = useSetRecoilState(showDropZoneState);

  const handleCreateVectorMap = useCallback(() => {
    createNewVectorMap();
  }, []);

  const handleCreateExternalVectorMap = useCallback(() => {
    createNewExternalVectorMap();
  }, []);

  const handleAddVectorMap = useCallback(() => {
    setShowDropZone(true);
  }, []);

  return (
    <div
      className={clsx(
        "geojson-container",
        isExternalVectorMapCreateAllowed() && "has-3-rows"
      )}
    >
      <div className="geojson-action">
        <button
          disabled={!isVectorMapCreateAllowed()}
          onClick={handleCreateVectorMap}
        >
          <VkfIcon name="addVectorMap" />
          <span>{translate("layermanagement-create-vector-map")}</span>
        </button>
      </div>

      {isExternalVectorMapCreateAllowed() && (
        <div className="geojson-action">
          <button onClick={handleCreateExternalVectorMap}>
            <VkfIcon name="addVectorMap" />
            <span>
              {translate("layermanagement-create-external-vector-map")}
            </span>
          </button>
        </div>
      )}

      <div className="geojson-action">
        <button onClick={handleAddVectorMap}>
          <SvgIcons name="layermanagement-upload" />
          <span>{translate("layermanagement-add-vector-map")}</span>
        </button>
      </div>
    </div>
  );
}
