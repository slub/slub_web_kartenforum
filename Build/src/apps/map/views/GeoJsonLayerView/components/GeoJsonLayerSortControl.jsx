/*
 * Created by tom.schulze@pikobytes.de on 08.09.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { translate } from "@util/util";
import React, { useCallback, useEffect, useMemo } from "react";
import SortControl, { SORT_STATE } from "@components/SortControl/SortControl";
import { useSetRecoilState } from "recoil";
import {
  geoJsonLayerViewFeaturesSortOrderState,
  geoJsonLayerViewFeaturesSortKeyState,
} from "../atoms";
import { FEATURE_PROPERTIES } from "@map/components/GeoJson/constants";

export const DEFAULT_FEATURE_SORT_KEY = FEATURE_PROPERTIES.title;
export const DEFAULT_FEATURE_SORT_ORDER = SORT_STATE.ASCENDING;

const GeoJsonLayerSortControl = () => {
  const setSortOrder = useSetRecoilState(
    geoJsonLayerViewFeaturesSortOrderState
  );
  const setSortKey = useSetRecoilState(geoJsonLayerViewFeaturesSortKeyState);

  const sortColumns = useMemo(
    () => [
      { sortKey: FEATURE_PROPERTIES.time, label: translate("mapsearch-time") },
      {
        sortKey: FEATURE_PROPERTIES.title,
        label: translate("mapsearch-title"),
      },
    ],
    []
  );

  const handleUpdateSortOrder = useCallback((sortKey, sortOrder) => {
    setSortKey(sortKey);
    setSortOrder(sortOrder);
  }, []);

  useEffect(() => {
    return () => {
      setSortKey(DEFAULT_FEATURE_SORT_KEY);
      setSortOrder(DEFAULT_FEATURE_SORT_ORDER);
    };
  }, []);

  return (
    <>
      <SortControl
        sortColumns={sortColumns}
        defaultSortKey={DEFAULT_FEATURE_SORT_KEY}
        defaultSortOrder={DEFAULT_FEATURE_SORT_ORDER}
        onUpdateSortOrder={handleUpdateSortOrder}
      />
    </>
  );
};

export default GeoJsonLayerSortControl;
