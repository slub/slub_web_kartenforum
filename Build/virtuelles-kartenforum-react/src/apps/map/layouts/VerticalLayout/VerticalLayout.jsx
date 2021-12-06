/**
 * Created by nicolas.looschen@pikobytes.de on 26.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { useRecoilValue } from "recoil";

import SearchHeader from "./components/SearchHeader/SearchHeader";
import LayerManagementButton from "./components/LayerManagementButton/LayerManagementButton";
import LayerManagement from "../../components/LayerManagement/LayerManagement";
import "./VerticalLayout.scss";
import FacetedSearch from "../../components/FacetedSearch/FacetedSearch";
import Modal from "../../../../components/Modal/Modal";
import { displayedLayersCountState } from "../../atoms/atoms";

export const VerticalLayout = () => {
  const displayedLayerCount = useRecoilValue(displayedLayersCountState);
  const [showFacets, setShowFacets] = useState(false);
  const [showLayerManagement, setShowLayerManagement] = useState(false);

  const handleToggleLayerManagement = () => {
    setShowLayerManagement((old) => !old);
  };

  const handleToggleFacets = () => {
    setShowFacets((oldState) => !oldState);
  };

  useEffect(() => {
    if (displayedLayerCount === 0 && showLayerManagement) {
      setShowLayerManagement(false);
    }
  }, [displayedLayerCount, showLayerManagement]);

  return (
    <div className="vkf-vertical-layout">
      <SearchHeader
        onToggleFacets={handleToggleFacets}
        showFacets={showFacets}
      />
      <LayerManagementButton
        buttonState={showLayerManagement}
        onClick={handleToggleLayerManagement}
      />
      <div
        className={clsx(
          "layermanagement-container",
          !showLayerManagement && "closed"
        )}
      >
        <LayerManagement
          showControls={{
            showBadge: false,
            showDynamicMapVisualization: false,
            showHideButton: true,
          }}
        />
      </div>

      <Modal
        modalClassName="faceted-search-modal"
        onClose={handleToggleFacets}
        renderContent={() => <FacetedSearch georeferenceMode={false} />}
        isOpen={showFacets}
        title="Filter"
      />
    </div>
  );
};

export default VerticalLayout;
