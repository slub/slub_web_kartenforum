/**
 * Created by nicolas.looschen@pikobytes.de on 29.06.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useCallback, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import PropTypes from "prop-types";
import { mosaicMapSelectedLayersState } from "@mosaic-map/atoms";

/**
 * Sort array of features by key
 * @param array
 * @param key
 * @returns {Array<{[p: string]: string|number}>}
 */
export function sortFeaturesByKey(array, key) {
  return array.sort(function (a, b) {
    let x = a.getMetadata(key);
    let y = b.getMetadata(key);

    if (typeof x == "string") {
      x = ("" + x).toLowerCase();
    }
    if (typeof y == "string") {
      y = ("" + y).toLowerCase();
    }

    return x < y ? -1 : x > y ? 1 : 0;
  });
}

export const SelectedMapDataProvider = ({
  minimumBatchSize = 20,
  renderConsumer,
  sortSettings,
}) => {
  // props
  const { activeType: sortAttribute, sortOrder } = sortSettings;

  // state
  const [searchResultDescriptor, setSearchResultDescriptor] = useState({
    itemCount: 10,
    id: Date.now(),
  });
  const selectedMosaicLayers = useRecoilValue(mosaicMapSelectedLayersState);

  // fetch the results from the index
  const fetchResults = useCallback(
    (start, size) => {
      if (selectedMosaicLayers === undefined) {
        return new Promise((res) => res([]));
      }

      return new Promise((resolve) => {
        const result = sortFeaturesByKey(
          selectedMosaicLayers.slice(start, start + size),
          sortAttribute
        );

        if (sortOrder === "descending") {
          result.reverse();
        }

        resolve(result);
      });
    },
    [selectedMosaicLayers, sortOrder, sortAttribute]
  );

  ////
  // Handler section
  ////

  const handleRefresh = useCallback(() => {
    setSearchResultDescriptor({
      itemCount: selectedMosaicLayers.length,
      id: Date.now(),
    });
  }, [fetchResults]);

  useEffect(() => {
    handleRefresh();
  }, [selectedMosaicLayers, sortAttribute, sortOrder]);

  return (
    <React.Fragment>
      {renderConsumer({
        minimumBatchSize,
        onRefresh: handleRefresh,
        onFetchResults: fetchResults,
        searchResultDescriptor,
      })}
    </React.Fragment>
  );
};

SelectedMapDataProvider.propTypes = {
  minimumBatchSize: PropTypes.number,
  renderConsumer: PropTypes.func,
  sortSettings: PropTypes.shape({
    activeType: PropTypes.string,
    sortOrder: PropTypes.string,
  }),
};
