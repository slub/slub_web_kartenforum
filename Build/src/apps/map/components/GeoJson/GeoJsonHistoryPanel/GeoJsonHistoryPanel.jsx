/*
 * Created by tom.schulze@pikobytes.de on 28.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { Suspense, useCallback, useMemo } from "react";
import { useSetRecoilState } from "recoil";
import { translate } from "@util/util";
import { drawModePanelState } from "@map/atoms";
import { DRAW_MODE_PANEL_STATE } from "@map/layouts/util";
import GeoJsonPanelHeader from "../GeoJsonPanelHeader";
import VersionHistory from "@map/components/GeoJson/GeoJsonHistoryPanel/components/VersionHistory/VersionHistory";

import "./GeoJsonHistoryPanel.scss";

const HistoryPanel = () => {
  const setDrawModePanel = useSetRecoilState(drawModePanelState);

  const introText = useMemo(() => {
    return translate("geojson-metadata-panel-intro-history");
  }, []);

  const title = useMemo(() => {
    return translate("geojson-metadata-panel-header-history");
  }, []);

  const handleCloseClick = useCallback(() => {
    setDrawModePanel(DRAW_MODE_PANEL_STATE.NONE);
  }, []);

  return (
    <div className="geojson-history-panel-root">
      <GeoJsonPanelHeader title={title} onCloseClick={handleCloseClick} />
      <div className="geojson-history-panel-content">
        <div className="introduction-text content-padding">{introText}</div>
        <div className="history-list-container content-padding">
          <Suspense fallback={<div>Loading...</div>}>
            <VersionHistory />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

HistoryPanel.propTypes = {};

export default HistoryPanel;
