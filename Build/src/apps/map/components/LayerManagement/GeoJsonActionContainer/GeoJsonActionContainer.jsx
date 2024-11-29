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
import { useCreateNewVectorMap } from "@map/components/GeoJson/util/hooks/useCreateNewVectorMap";

export default function GeoJsonActionContainer() {
  const createNewVectorMap = useCreateNewVectorMap();
  const setShowDropZone = useSetRecoilState(showDropZoneState);

  const handleCreateVectorMap = useCallback(() => {
    createNewVectorMap();
  }, []);

  const handleAddVectorMap = useCallback(() => {
    setShowDropZone(true);
  }, []);

  return (
    <div className="geojson-container">
      <div className="geojson-action">
        <button onClick={handleCreateVectorMap}>
          <VkfIcon name="addVectorMap" />
          <span>{translate("layermanagement-create-vector-map")}</span>
        </button>
      </div>

      <div className="geojson-action">
        <button onClick={handleAddVectorMap}>
          <SvgIcons name="layermanagement-upload" />
          <span>{translate("layermanagement-add-vector-map")}</span>
        </button>
      </div>
    </div>
  );
}
