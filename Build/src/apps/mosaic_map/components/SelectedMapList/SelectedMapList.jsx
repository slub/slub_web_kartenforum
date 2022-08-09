/**
 * Created by nicolas.looschen@pikobytes.de on 29.06.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import clsx from "clsx";
import { useRecoilState, useRecoilValue } from "recoil";
import { Button, Glyphicon } from "react-bootstrap";

import MapSearchResultList from "../../../map/components/MapSearch/components/MapSearchResultList/MapSearchResultList";
import { SelectedMapDataProvider } from "./SelectedMapDataProvider.jsx";
import { translate } from "../../../../util/util.js";
import FacetedSearch from "../../../map/components/FacetedSearch/FacetedSearch.jsx";
import { mosaicMapSelectedFeaturesState } from "../../atoms/atoms.js";
import MosaicMapSelectedMapListElement from "../ListElement/MosaicMapSelectedMapListElement/MosaicMapSelectedMapListElement.jsx";
import { selectedFeaturesState } from "../../../map/atoms/atoms.js";
import { LAYER_TYPES } from "../../../map/components/CustomLayers/LayerTypes.js";

import "./SelectedMapList.scss";

export const SelectedMapList = () => {
  const selectedSingleSheets = useRecoilValue(selectedFeaturesState);
  const [selectedFeatures, setSelectedFeatures] = useRecoilState(
    mosaicMapSelectedFeaturesState
  );

  // derived state
  const disabled = selectedFeatures.length === 0;
  const areAllShown =
    !disabled &&
    selectedFeatures.every((selectedFeature) => selectedFeature.showPreview);

  // only enable the button in case there are selected features which are not in the mosaic map selection
  const disableAddSelectedButton =
    selectedSingleSheets.length === 0 ||
    selectedSingleSheets.filter(
      (sheet) =>
        selectedFeatures.find(
          (selectedFeature) =>
            selectedFeature.feature.getId() ===
            `${sheet.feature.getId()}_mosaic_map_preview`
        ) !== undefined
    ).length === selectedSingleSheets.length;

  const handleAddAll = () => {
    selectedSingleSheets.forEach(({ feature }) => {
      const id = `${feature.getId()}_mosaic_map_preview`;

      if (
        selectedFeatures.find(
          (selectedFeature) => selectedFeature.feature.getId() === id
        ) === undefined
      ) {
        const newFeature = feature.clone();

        // adjust properties to reflect the preview usage
        newFeature.setId(id);
        newFeature.set("layer_type", LAYER_TYPES.PREVIEW);
        setSelectedFeatures((oldFeatures) => [
          ...oldFeatures,
          {
            feature: newFeature,
            type: LAYER_TYPES.HISTORIC_MAP,
          },
        ]);
      }
    });
  };

  const handleHideAll = () => {
    setSelectedFeatures((oldSelectedFeatures) =>
      oldSelectedFeatures.map((selectedFeature) => ({
        ...selectedFeature,
        showPreview: false,
      }))
    );
  };

  const handleRemoveAll = () => {
    setSelectedFeatures([]);
  };

  const handleShowAll = () => {
    setSelectedFeatures((oldSelectedFeatures) =>
      oldSelectedFeatures.map((selectedFeature) => ({
        ...selectedFeature,
        showPreview: true,
      }))
    );
  };

  return (
    <div className={clsx("mapsearch-container")}>
      <div className="spatialsearch-inner-container">
        <div className="spatialsearch-content-panel">
          <div className="body-container">
            <div className="header-container">
              <div className="title">
                <h4>{translate("mosaic-maps-refresh-selected-list-title")}</h4>
                <Glyphicon glyph="th-large" />
              </div>
              <div className="actions">
                <div className="add-all-selected">
                  <Button
                    disabled={disableAddSelectedButton}
                    onClick={handleAddAll}
                  >
                    {translate("mosaic-maps-add-all-selected")}
                  </Button>
                </div>
                <div className="action-container">
                  <div className="view-all-toggle control">
                    <button
                      className={clsx(!areAllShown && "selected")}
                      disabled={disabled}
                      onClick={areAllShown ? handleHideAll : handleShowAll}
                    >
                      <Glyphicon
                        glyph={areAllShown ? "eye-open" : "eye-close"}
                      />
                    </button>
                  </div>
                  <div className="select-all-toggle control">
                    <button disabled={disabled} onClick={handleRemoveAll}>
                      <Glyphicon glyph="trash" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel panel-default searchTablePanel">
              <div className="panel-heading">
                <div className="content">
                  <div>
                    {selectedFeatures.length === 0
                      ? translate("mosaic-maps-selected-no-maps")
                      : `${selectedFeatures.length} ${translate(
                          "mosaic-maps-selected-maps"
                        )}`}
                  </div>
                </div>
                <div className="facet-container">
                  <FacetedSearch georeferenceMode={false} />
                </div>
              </div>
              <div className="panel-body">
                <MapSearchResultList
                  enableOverlayLayer={false}
                  DataProvider={SelectedMapDataProvider}
                  ListItemComponent={MosaicMapSelectedMapListElement}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedMapList;
