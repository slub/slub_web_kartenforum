/**
 * Created by nicolas.looschen@pikobytes.de on 23.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useRef } from "react";
import { useRecoilState } from "recoil";
import { translate } from "../../../../util/util";
import Modal from "../../../../components/Modal/Modal";
import { selectedOriginalMapIdState } from "../../atoms/atoms";
import LayerManagement from "../../components/LayerManagement/LayerManagement";
import SpatialTemporalSearch from "../../components/SpatialTemporalSearch/SpatialTemporalSearch";
import OriginalMapView from "../../views/OriginalMapView/OriginalMapView";
import { useSetElementScreenSize } from "../../../../util/hooks";

export const HorizontalLayout = () => {
  const [selectedOriginalMapId, setOriginalMapId] = useRecoilState(
    selectedOriginalMapIdState
  );

  //refs
  const spatialSearchRef = useRef(null);

  useSetElementScreenSize(spatialSearchRef, "spatialtemporalsearch");

  return (
    <React.Fragment>
      <div className="vkf-horizontal-layout">
        <div
          className="spatialsearch-container"
          id="spatialsearch-container"
          ref={spatialSearchRef}
        >
          <SpatialTemporalSearch />
        </div>
        <div
          className="layermanagement-container"
          id="layermanagement-container"
        >
          <LayerManagement />
        </div>
      </div>
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
    </React.Fragment>
  );
};
