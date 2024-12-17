/*
 * Created by tom.schulze@pikobytes.de on 28.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { Suspense, useCallback, useMemo } from "react";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { isDefined, translate } from "@util/util";
import { drawModePanelState, vectorMapDrawState } from "@map/atoms";
import { DRAW_MODE_PANEL_STATE } from "@map/layouts/util";
import GeoJsonPanelHeader from "../GeoJsonPanelHeader";
import VersionHistory from "@map/components/GeoJson/GeoJsonHistoryPanel/components/VersionHistory/VersionHistory";

import "./GeoJsonHistoryPanel.scss";

const HistoryPanel = () => {
  const setDrawModePanel = useSetRecoilState(drawModePanelState);
  const vectorMapDraw = useRecoilValue(vectorMapDrawState);

  const isUnsavedMap = useMemo(() => {
    return !isDefined(vectorMapDraw.id);
  }, [vectorMapDraw.id]);

  const introText = useMemo(() => {
    if (isUnsavedMap) {
      return translate("geojson-metadata-panel-intro-history-unsaved");
    }
    return translate("geojson-metadata-panel-intro-history");
  }, [isUnsavedMap]);

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
