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

import MapSearchResultList from "@map/components/MapSearch/components/MapSearchResultList/MapSearchResultList";
import { SelectedMapDataProvider } from "./SelectedMapDataProvider.jsx";
import { translate } from "@util/util.js";
import FacetedSearch from "@map/components/FacetedSearch";
import { mosaicMapSelectedLayersState } from "@mosaic-map/atoms";
import MosaicMapSelectedMapListElement from "@mosaic-map/components/ListElement/MosaicMapSelectedMapListElement/MosaicMapSelectedMapListElement.jsx";
import { selectedLayersState, mapState } from "@map/atoms";
import {
  MOSAIC_MAP_OVERLAY_SOURCE_ID,
  moveMosaicOverlayToTop,
  resetMosaicOverlaySource,
} from "@mosaic-map/components/MosaicMapOverlayLayer/MosaicMapOverlayLayer";

import "./SelectedMapList.scss";

export const SelectedMapList = () => {
  const map = useRecoilValue(mapState);
  const [selectedLayers, setSelectedLayers] =
    useRecoilState(selectedLayersState);
  const [selectedMosaicLayers, setSelectedMosaicLayers] = useRecoilState(
    mosaicMapSelectedLayersState
  );

  // derived state
  const disabled = selectedMosaicLayers.length === 0;

  const areAllShown =
    !disabled &&
    selectedMosaicLayers.every((selectedMosaicLayer) =>
      selectedMosaicLayer.isDisplayedInMap(map)
    );

  // only enable the button in case there are selected features which are not in the mosaic map selection
  const disableAddSelectedButton =
    selectedLayers.length === 0 ||
    selectedLayers.filter(
      (sheet) =>
        selectedMosaicLayers.find(
          (selectedMosaicLayer) => selectedMosaicLayer.getId() === sheet.getId()
        ) !== undefined
    ).length === selectedLayers.length;

  const handleAddAll = () => {
    selectedLayers.forEach((sheet) => {
      const id = sheet.getId();

      if (
        selectedMosaicLayers.find(
          (selectedLayer) => selectedLayer.getId() === id
        ) === undefined
      ) {
        setSelectedMosaicLayers((oldFeatures) => [...oldFeatures, sheet]);
        sheet.addToOverlay(map, MOSAIC_MAP_OVERLAY_SOURCE_ID);
      }
    });
  };

  const handleToggleMapDisplay = () => {
    const selectedMosaicIds = selectedMosaicLayers.map((layer) =>
      layer.getId()
    );

    if (areAllShown) {
      setSelectedLayers((selectedLayers) =>
        selectedLayers.filter(
          (layer) => !selectedMosaicIds.includes(layer.getId())
        )
      );

      selectedMosaicLayers.forEach((layer) => layer.removeMapLibreLayers(map));
      return;
    }

    //@TODO: Add loading feedback, while layer is added to map
    selectedMosaicLayers
      .filter((layer) => !layer.isDisplayedInMap(map))
      .forEach((layer) =>
        layer.addLayerToMap(map).then(() => {
          setSelectedLayers((selectedLayers) => [...selectedLayers, layer]);
        })
      );
    moveMosaicOverlayToTop(map);
  };

  const handleRemoveAll = () => {
    setSelectedMosaicLayers([]);
    resetMosaicOverlaySource(map);
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
                      onClick={handleToggleMapDisplay}
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
                    {selectedMosaicLayers.length === 0
                      ? translate("mosaic-maps-selected-no-maps")
                      : `${selectedMosaicLayers.length} ${translate(
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
