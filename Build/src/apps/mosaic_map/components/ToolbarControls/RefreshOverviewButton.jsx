/**
 * Created by nicolas.looschen@pikobytes.de on 30.06.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

import { postRefreshMosaicMaps } from "../../../../util/apiMosaicMaps.js";
import ControlButton from "../../../georeferencer/components/ControlButton/ControlButton.jsx";
import { translate } from "../../../../util/util.js";
import { mosaicMapSelectedMosaicMapState } from "../../atoms/atoms.js";
import { VALUE_CREATE_NEW_MAP } from "../MosaicMapSelectorDropdown/MosaicMapSelectorDropdown.jsx";
import { notificationState } from "../../../../atoms/atoms.js";

export const RefreshOverviewButton = () => {
  const selectedMosaicMap = useRecoilValue(mosaicMapSelectedMosaicMapState);
  const setNotification = useSetRecoilState(notificationState);

  const handleRecalculateOverview = () => {
    if (selectedMosaicMap !== undefined) {
      postRefreshMosaicMaps(selectedMosaicMap.id)
        .then(() => {
          setNotification({
            id: "mosaic-map-refresh-overview-button",
            type: "success",
            text: translate("mosaic-map-success-messages-updated-overview"),
          });
        })
        .catch((error) => {
          console.error(error);
          setNotification({
            id: "mosaic-map-refresh-overview-button",
            type: "danger",
            text: translate("mosaic-map-error-messages-failed-update-overview"),
          });
        });
    }
  };

  return (
    <ControlButton
      disabled={selectedMosaicMap.id === VALUE_CREATE_NEW_MAP}
      id="recalculate-overview"
      iconClassName="icon-reload"
      onClick={handleRecalculateOverview}
      title={translate("mosaic-maps-refresh-overview")}
    />
  );
};

export default RefreshOverviewButton;
