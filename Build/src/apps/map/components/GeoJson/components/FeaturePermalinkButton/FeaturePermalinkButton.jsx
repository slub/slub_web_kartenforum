/*
 * Created by tom.schulze@pikobytes.de on 07.02.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React, { useMemo } from "react";

import CopyToClipboardButton from "@components/CopyToClipboardButton";
import { isDefined, translate } from "@util/util.js";
import { useRecoilValue } from "recoil";
import {
  selectedGeoJsonFeatureIdentifierState,
  selectedLayersState,
} from "@map/atoms";
import { METADATA } from "@map/components/CustomLayers";
import useGenerateFeaturePermalink from "./useGenerateFeaturePermalink";

import "./FeaturePermalinkButton.scss";

export const FeaturePermalinkButton = () => {
  const selectedLayers = useRecoilValue(selectedLayersState);
  const selectedGeoJsonFeatureIdentifier = useRecoilValue(
    selectedGeoJsonFeatureIdentifierState
  );

  const isRemoteFeature = useMemo(() => {
    if (
      isDefined(selectedGeoJsonFeatureIdentifier) &&
      isDefined(selectedLayers)
    ) {
      const { sourceId } = selectedGeoJsonFeatureIdentifier;
      const layer = selectedLayers.find((layer) => layer.getId() === sourceId);
      return isDefined(layer?.getMetadata(METADATA.vectorMapId));
    }

    return false;
  }, [selectedLayers, selectedGeoJsonFeatureIdentifier]);

  const generatePermalink = useGenerateFeaturePermalink();

  if (!isRemoteFeature) {
    return null;
  }

  return (
    <div className="feature-permalink-button-root">
      <CopyToClipboardButton
        title={translate("feature-permalink-exporter-copy-title")}
        onClick={generatePermalink}
        value=""
      />
    </div>
  );
};

export default FeaturePermalinkButton;
