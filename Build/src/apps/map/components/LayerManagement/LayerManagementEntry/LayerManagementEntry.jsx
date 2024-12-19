/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useEffect, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import PropTypes from "prop-types";
import clsx from "clsx";
import { useDoubleTap } from "use-double-tap";

import { translate } from "@util/util";

import { OpacitySlider } from "@components/OpacitySlider/OpacitySlider";
import SettingsProvider from "@settings-provider";
import SvgIcons from "@components/SvgIcons/SvgIcons.jsx";
import {
  GeoJsonLayer,
  HistoricMapLayer,
  LAYER_TYPES,
  METADATA,
} from "@map/components/CustomLayers";
import DragButton from "./components/DragButton/DragButton.jsx";
import VisibilityButton from "./components/VisibilityButton/VisibilityButton.jsx";
import RemoveLayerButton from "./components/RemoveLayerButton/RemoveLayerButton.jsx";
import ZoomToExtentButton from "./components/ZoomToExtentButton/ZoomToExtentButton.jsx";
import MoveToTopButton from "./components/MoveToTopButton/MoveToTopButton.jsx";
import LayerManagementThumbnail from "./components/LayerManagementThumbnail/LayerManagementThumbnail.jsx";
import ShowOriginalButton from "./components/ShowOriginalButton/ShowOriginalButton.jsx";
import ShowGeoJsonLayerButton from "./components/ShowGeoJsonLayerButton/ShowGeoJsonLayerButton";
import "./LayerManagementEntry.scss";

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

  const layerId = layer.getId();
  const layerType = layer.getType();
  const layerPublished = layer.getMetadata(METADATA.timePublished);
  const layerTitle = layer.getMetadata(METADATA.title);
  const layerMetadataType = layer.getMetadata(METADATA.type);
  const isMosaicMap = layerMetadataType === "mosaic";

  return (
    <li
      className={clsx(
        "vkf-layermanagement-record",
        isDragging && "drag-and-drop-placeholder",
        isShowActions && "show-actions",
        layerType === LAYER_TYPES.VECTOR_MAP && "geojson-data",
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
            "mapsearch-listelement-time"
          )} ${layerPublished}`}</span>
        </div>
      </div>
      <div className="control-container">
        <MoveToTopButton layer={layer} />
        <RemoveLayerButton layer={layer} />
        <ZoomToExtentButton layer={layer} />
        {layerType !== LAYER_TYPES.VECTOR_MAP ? (
          <ShowOriginalButton layer={layer} />
        ) : (
          <ShowGeoJsonLayerButton layer={layer} />
        )}
        {!isMosaicMap &&
          settings["LINK_TO_GEOREFERENCE"] !== undefined &&
          layerType !== LAYER_TYPES.VECTOR_MAP && (
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
    PropTypes.instanceOf(GeoJsonLayer),
    PropTypes.instanceOf(HistoricMapLayer),
  ]),
  onMoveLayer: PropTypes.func,
  showActions: PropTypes.func,
};

export default LayerManagementEntry;
