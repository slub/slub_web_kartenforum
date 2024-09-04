/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { useDrag, useDrop } from "react-dnd";
import PropTypes from "prop-types";
import clsx from "clsx";
import { useDoubleTap } from "use-double-tap";

import { translate } from "../../../../../util/util";
import {
  selectedFeaturesState,
  selectedOriginalMapIdState,
} from "../../../atoms/atoms";
import { OpacitySlider } from "../../../../../components/OpacitySlider/OpacitySlider";
import { FALLBACK_SRC } from "../../MapSearch/components/MapSearchListElement/MapSearchListElementBase.jsx";
import HistoricMap from "../../CustomLayers/HistoricMapLayer";
import SettingsProvider from "../../../../../SettingsProvider";
import { serializeOperationalLayer } from "../../../persistence/util";
import { triggerJsonDownload } from "../util";
import { LAYER_TYPES } from "../../CustomLayers/LayerTypes";
import SvgIcons from "../../../../../components/SvgIcons/SvgIcons.jsx";
import GeoJsonLayer from "../../CustomLayers/GeoJsonLayer.js";
import DragButton from "./components/DragButton/DragButton.jsx";
import "./LayerManagementEntry.scss";
import VisibilityButton from "./components/VisibilityButton/VisibilityButton.jsx";
import RemoveLayerButton from "./components/RemoveLayerButton/RemoveLayerButton.jsx";
import ZoomToExtentButton from "./components/ZoomToExtentButton/ZoomToExtentButton.jsx";
import MoveToTopButton from "./components/MoveToTopButton/MoveToTopButton.jsx";
import LayerManagementThumbnail from "./components/LayerManagementThumbnail/LayerManagementThumbnail.jsx";

export const ItemTypes = {
  LAYER: "LAYER",
};

export const LayerManagementEntry = (props) => {
  const { id, index, layer, onMoveLayer } = props;
  const [entered, setEntered] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [isShowActions, setShowActions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const [selectedFeatures] = useRecoilState(selectedFeaturesState);
  const setSelectedOriginalMapId = useSetRecoilState(
    selectedOriginalMapIdState
  );
  const settings = SettingsProvider.getSettings();

  // drag/drop handlers from: https://react-dnd.github.io/react-dnd/examples/sortable/simple
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.LAYER,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      onMoveLayer(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ draggedItem, isDragging }, drag] = useDrag({
    type: ItemTypes.LAYER,
    item: () => {
      return { id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      draggedItem: monitor.getItem(),
    }),
  });

  ////
  // Handler section
  ////

  // check if the new active element is within the element before unhovering it on keyboard navigation
  const handleBlur = () =>
    setTimeout(() => {
      if (ref.current !== null) {
        if (!ref.current.contains(document.activeElement)) {
          handleMouseLeave();
        }
      }
    }, 100);

  // triggers the download of a geojson file name like the clicked layer
  const handleExportGeojson = () => {
    const id = layerId;
    const selectedFeature = selectedFeatures.find(
      (selFeature) => selFeature.feature.getId() === id
    );
    const serializedLayer = serializeOperationalLayer(selectedFeature, layer);

    triggerJsonDownload(
      serializedLayer.properties.title,
      JSON.stringify(serializedLayer.geojson)
    );
  };

  // propagate hovered layer id if no drag is in progress
  const handleMouseEnter = () => {
    setEntered(true);
  };

  // reset hovered layer id if no drag is in progress
  const handleMouseLeave = () => {
    setEntered(false);
  };

  // toggle function buttons on double click/tap
  const handleDoubleTap = useDoubleTap(() => {
    setShowActions((oldShowActions) => !oldShowActions);
  }, 500);

  // Open original map
  const handleOriginalMap = () => {
    setSelectedOriginalMapId(id);
  };

  const handleStartSliding = () => {
    setIsSliding(true);
  };

  const handleEndSliding = () => {
    setIsSliding(false);
  };

  ////
  // Effect section
  ////

  useEffect(() => {
    if (entered) {
      if (draggedItem === null && !isHovered) {
        setIsHovered(true);
      }
    } else {
      if (draggedItem !== undefined && !isSliding) {
        setIsHovered(false);
      }
    }
  }, [entered, isHovered, isSliding, draggedItem]);

  drag(drop(ref));

  const layerPublished = layer.metadata["vkf:time_published"];
  const layerId = layer.metadata["vkf:id"];
  const layerType = layer.metadata["vkf:type"];
  const layerTitle = layer.metadata["vkf:title"];
  const isMosaicMap = layerType === "mosaic";

  return (
    <li
      className={clsx(
        "vkf-layermanagement-record",
        isDragging && "drag-and-drop-placeholder",
        isShowActions && "show-actions",
        layerType === LAYER_TYPES.GEOJSON && "geojson-data",
        isHovered &&
          (draggedItem === null || draggedItem.id === layerId) &&
          "force-hover"
      )}
      id={index}
      data-id={layerId}
      data-handler-id={handlerId}
      onFocus={handleMouseEnter}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseOver={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...handleDoubleTap}
      ref={ref}
    >
      <div className="visibility-container">
        <VisibilityButton layer={layer} />
      </div>
      <LayerManagementThumbnail layer={layer} />
      <div className="metadata-container">
        <h3>{layerTitle}</h3>
        <div className="timestamps">
          <span className="timestamps-label">{`${translate(
            "layermanagement-timestamp"
          )} ${layerPublished}`}</span>
        </div>
        {isMosaicMap && (
          <div className="type">
            <span className="timestamps-label">{`${translate(
              "originalview-title-mosaic"
            )}`}</span>
          </div>
        )}
      </div>
      <div className="control-container">
        <MoveToTopButton layer={layer} />
        <RemoveLayerButton layer={layer} />
        <ZoomToExtentButton layer={layer} />
        {layerType !== LAYER_TYPES.GEOJSON ? (
          <button
            className="show-original"
            onClick={handleOriginalMap}
            type="button"
            title={translate("layermanagement-show-original")}
          >
            <SvgIcons name="layeraction-showoriginal" />
          </button>
        ) : (
          <button
            className="export-geojson"
            onClick={handleExportGeojson}
            type="button"
            title={translate("layermanagement-export")}
          >
            <SvgIcons name="layeraction-export" />
          </button>
        )}
        {!isMosaicMap &&
          settings["LINK_TO_GEOREFERENCE"] !== undefined &&
          layerType !== LAYER_TYPES.GEOJSON && (
            <button
              className="georeference-update"
              title={`${translate("layermangement-georef-update")} ...`}
              onClick={() => {
                window.open(
                  `${settings["LINK_TO_GEOREFERENCE"]}?map_id=${layerId}`,
                  "_blank"
                );
              }}
            >
              <SvgIcons name="icon-point-move" />
            </button>
          )}
        <OpacitySlider
          onStartDrag={handleStartSliding}
          onEndDrag={handleEndSliding}
          orientation="horizontal"
          layer={layer}
        />
      </div>
      <div className="drag-container">
        <DragButton tabIndex={-1} />
      </div>
    </li>
  );
};

LayerManagementEntry.propTypes = {
  id: PropTypes.string,
  index: PropTypes.number,
  layer: PropTypes.oneOfType([
    PropTypes.instanceOf(HistoricMap),
    PropTypes.instanceOf(GeoJsonLayer),
  ]),
  onMoveLayer: PropTypes.func,
  showActions: PropTypes.func,
};

export default LayerManagementEntry;
