/**
 * Created by nicolas.looschen@pikobytes.de on 26.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useCallback, useState } from "react";
import clsx from "clsx";

import SearchHeader from "./components/SearchHeader/SearchHeader";
import LayerManagementButton from "./components/LayerManagementButton/LayerManagementButton";
import LayerManagement from "@map/components/LayerManagement";
import FacetedSearch from "@map/components/FacetedSearch";
import Modal from "@components/Modal";
import LayerManagementCloser from "./components/LayerManagementCloser/LayerManagementCloser.jsx";
import "./VerticalLayout.scss";

export const VerticalLayout = () => {
  const [showFacets, setShowFacets] = useState(false);
  const [showLayerManagement, setShowLayerManagement] = useState(false);

  const handleCloseLayerManagement = useCallback(() => {
    setShowLayerManagement(false);
  }, []);

  const handleToggleLayerManagement = useCallback(() => {
    setShowLayerManagement((old) => !old);
  }, []);

  const handleToggleFacets = () => {
    setShowFacets((oldState) => !oldState);
  };

  return (
    <React.Fragment>
      <LayerManagementCloser
        onCloseLayerManagement={handleCloseLayerManagement}
      />
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
      </div>
      <Modal
        modalClassName="faceted-search-modal"
        onClose={handleToggleFacets}
        renderContent={() => <FacetedSearch georeferenceMode={false} />}
        isOpen={showFacets}
        title="Filter"
      />
    </React.Fragment>
  );
};

export default VerticalLayout;
