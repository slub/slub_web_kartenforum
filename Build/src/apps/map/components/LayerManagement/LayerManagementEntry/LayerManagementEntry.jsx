/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { useDrag, useDrop } from "react-dnd";
import PropTypes from "prop-types";
import clsx from "clsx";
import { useDoubleTap } from "use-double-tap";

import { isDefined, translate } from "../../../../../util/util";
import {
  mapState,
  olcsMapState,
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
import RemoveLayerButton from "./components/RemoveLayerButton.jsx";

export const ItemTypes = {
  LAYER: "LAYER",
};

export const LayerManagementEntry = (props) => {
  const { id, index, layer, onMoveLayer } = props;
  const [entered, setEntered] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [isShowActions, setShowActions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const map = useRecoilValue(mapState);
  const olcsMap = useRecoilValue(olcsMapState);
  const ref = useRef(null);
  const [selectedFeatures] = useRecoilState(selectedFeaturesState);
  const setSelectedOriginalMapId = useSetRecoilState(
    selectedOriginalMapIdState
  );
  const [src, setSrc] = useState(layer.metadata["vkf:thumb_url"]);
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

  // load fallback image in case the image from the supplied url cannot be loaded
  const handleError = () => {
    if (src !== FALLBACK_SRC) {
      setSrc(FALLBACK_SRC);
    }
  };

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

  // Move layer to the top of the stack
  const handleMoveTop = (event) => {
    map.removeLayer(layer);
    map.addLayer(layer);
    event.stopPropagation();
    if (olcsMap !== undefined) {
      olcsMap.getAutoRenderLoop().restartRenderLoop();
    }
  };

  // zoom to the layer
  const handleZoomToExtent = () => {
    if (isDefined(map)) {
      const extent =
        layerType === LAYER_TYPES.GEOJSON
          ? layer.getSource().getExtent()
          : layer.getExtent();
      // add percentage based padding
      map.getView().fit(extent, { padding: [50, 350, 50, 350] });
    }
  };

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
      {layerType === LAYER_TYPES.GEOJSON ? (
        <React.Fragment>
          <div className="thumbnail-container">
            <img
              src={settings.FALLBACK_THUMBNAIL}
              alt={`GeoJSON Image for ${layerTitle}`}
            />
            <span className="geojson-badge">GeoJSON</span>
          </div>
        </React.Fragment>
      ) : (
        <div className="thumbnail-container">
          <img
            onError={handleError}
            src={src}
            alt={`Thumbnail Image of Map for ${layerTitle}`}
          />
        </div>
      )}
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
        <button
          className="move-layer-top minimize-tool"
          onClick={handleMoveTop}
          type="button"
          title={translate("layermanagement-move-top")}
        >
          <SvgIcons name="layeraction-totop" />
        </button>
        <RemoveLayerButton layer={layer} />
        <button
          className="zoom-layer minimize-tool"
          onClick={handleZoomToExtent}
          type="button"
          title={translate("layermanagement-zoom-to-map")}
        >
          <SvgIcons name="layeraction-center" />
        </button>
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
