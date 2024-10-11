/**
 * Created by nicolas.looschen@pikobytes.de on 04.07.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import equal from "fast-deep-equal";
import clsx from "clsx";

import {
  mosaicMapLoadingState,
  MosaicMapLoadingStates,
  mosaicMapSelectedMosaicMapState,
} from "@mosaic-map/atoms";
import { VALUE_CREATE_NEW_MAP } from "@mosaic-map/components/MosaicMapSelectorDropdown/MosaicMapSelectorDropdown";
import LoadingSpinner from "@components/LoadingSpinner/LoadingSpinner.jsx";
import { usePrevious } from "@util/hooks.js";
import { translate } from "@util/util.js";
import "./SaveIndicator.scss";

export const SaveStates = {
  LOADING: 0,
  SAVED: 1,
  CHANGED: 2,
};

export const useSavedState = () => {
  const selectedMosaicMap = useRecoilValue(mosaicMapSelectedMosaicMapState);
  const [initialSelectedMosaicMap, setInitialSelectedMosaicMap] =
    useState(selectedMosaicMap);
  const loadingState = useRecoilValue(mosaicMapLoadingState);
  const previousLoadingState = usePrevious(loadingState);

  // if the id of the selected map changes, update the initial selected map
  useEffect(() => {
    setInitialSelectedMosaicMap(selectedMosaicMap);
  }, [selectedMosaicMap.id]);

  // if the current map has been uploaded and the selectedMapState has been updated
  useEffect(() => {
    if (
      loadingState !== MosaicMapLoadingStates.UPLOADING_CHANGES &&
      previousLoadingState === MosaicMapLoadingStates.UPLOADING_CHANGES
    ) {
      setInitialSelectedMosaicMap(selectedMosaicMap);
    }
  }, [loadingState]);

  let savedState;

  if (loadingState === MosaicMapLoadingStates.UPLOADING_CHANGES) {
    savedState = SaveStates.LOADING;
  } else if (
    initialSelectedMosaicMap.id !== VALUE_CREATE_NEW_MAP &&
    equal(initialSelectedMosaicMap, selectedMosaicMap)
  ) {
    savedState = SaveStates.SAVED;
  } else {
    savedState = SaveStates.CHANGED;
  }

  return savedState;
};

export const SaveIndicator = () => {
  const savedState = useSavedState();

  return (
    <div className="vkf-mosaic-map-save-indicator">
      <label>
        {savedState === SaveStates.SAVED
          ? translate("mosaic-map-saved-indicator-saved")
          : translate("mosaic-map-saved-indicator-not-saved")}
      </label>
      {SaveStates.LOADING === savedState ? (
        <LoadingSpinner />
      ) : (
        <div
          className={clsx(
            "indicator",
            savedState === SaveStates.SAVED && "saved",
            savedState === SaveStates.CHANGED && "changed"
          )}
        />
      )}
    </div>
  );
};

export default SaveIndicator;
