/**
 * Created by nicolas.looschen@pikobytes.de on 23.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import { useRecoilState } from "recoil";
import { translate } from "../../../../util/util";
import Modal from "../../../../components/Modal/Modal";
import { selectedOriginalMapIdState } from "../../atoms/atoms";
import { DetachedLayerManagement } from "../../components/LayerManagement/LayerManagement";
import SpatialTemporalSearch from "../../components/SpatialTemporalSearch/SpatialTemporalSearch";
import OriginalMapView from "../../views/OriginalMapView/OriginalMapView";
import "./HorizontalLayout.scss";

export const HorizontalLayout = () => {
  const [selectedOriginalMapId, setOriginalMapId] = useRecoilState(
    selectedOriginalMapIdState
  );

  return (
    <div className="vkf-horizontal-layout">
      <div className="spatialsearch-container" id="spatialsearch-container">
        <SpatialTemporalSearch />
      </div>
      <DetachedLayerManagement />

      {selectedOriginalMapId !== undefined && (
        <Modal
          key={selectedOriginalMapId}
          modalClassName="vkf-modal-original-map"
          onClose={() => setOriginalMapId(undefined)}
          renderContent={() => (
            <OriginalMapView map_id={selectedOriginalMapId} />
          )}
          isOpen={true}
          title={translate("originalview-title")}
        />
      )}
    </div>
  );
};
