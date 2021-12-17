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
import { fromExtent } from "ol/geom/Polygon";

import { isDefined, translate } from "../../../../../util/util";
import {
  mapState,
  selectedFeaturesState,
  selectedOriginalMapIdState,
} from "../../../atoms/atoms";
import { OpacitySlider } from "../OpacitySlider/OpacitySlider";
import { FALLBACK_SRC } from "../../MapSearch/components/MapSearchListElement/MapSearchListElement";
import HistoricMap from "../../HistoricMapLayer/HistoricMapLayer";
import SettingsProvider from "../../../../../SettingsProvider";
import "./LayerManagementEntry.scss";

export const ItemTypes = {
  LAYER: "LAYER",
};

export const LayerManagementEntry = (props) => {
  const { hovered, id, index, layer, onMoveLayer, onUpdateHover } = props;
  const map = useRecoilValue(mapState);
  const ref = useRef(null);
  const [selectedFeatures, setSelectedFeatures] = useRecoilState(
    selectedFeaturesState
  );
  const setSelectedOriginalMapId = useSetRecoilState(
    selectedOriginalMapIdState
  );
  const [src, setSrc] = useState(layer.getThumbnail());
  const [isVisible, setIsVisible] = useState(layer["getVisible"]());
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

  // load fallback image in case the image from the supplied url cannot be loaded
  const handleError = () => {
    if (src !== FALLBACK_SRC) {
      setSrc(FALLBACK_SRC);
    }
  };

  // change visibility of the layer
  const handleChangeVisibility = () => {
    setIsVisible(!isVisible);
  };

  // propagate hovered layer id if no drag is in progress
  const handleMouseEnter = () => {
    if (draggedItem === null && !hovered) {
      onUpdateHover(layer.getId());
    }
  };

  // reset hovered layer id if no drag is in progress
  const handleMouseLeave = () => {
    if (draggedItem === null) {
      onUpdateHover(undefined);
    }
  };

  // Move layer to the top of the stack
  const handleMoveTop = (event) => {
    map.removeLayer(layer);
    map.addLayer(layer);
    event.stopPropagation();
    // @TODO: REFRESH 3D VIEW HERE
    // vk2.utils.refresh3DView();
  };

  // Remove layer from layer stack
  const handleRemoveLayer = (event) => {
    map.removeLayer(layer);
    event.stopPropagation();

    setSelectedFeatures(
      selectedFeatures.filter(
        ({ feature }) => feature.getId() !== layer.getId()
      )
    );
    // @TODO: REFRESH 3D VIEW HERE
    // vk2.utils.refresh3DView();
  };

  // Update visibility from layer if it is different from the internal state
  const handleUpdateVisibility = () => {
    const layerVisibility = layer["getVisible"]();
    if (layerVisibility !== isVisible) setIsVisible(layerVisibility);
  };

  // zoom to the layer
  const handleZoomToExtent = () => {
    if (isDefined(map)) {
      const geometry = fromExtent(layer.getExtent());
      // add percentage based padding
      geometry.scale(1.5);
      map.getView().fit(geometry);
    }
  };

  // Open original map
  const handleOriginalMap = () => {
    setSelectedOriginalMapId(id);
  };

  ////
  // Effect section
  ////

  // Add visibility change handler to layer
  useEffect(() => {
    layer.on("change:visible", handleUpdateVisibility);
    return () => {
      layer.un("change:visible", handleUpdateVisibility);
    };
  });

  // Set layer visibility on local change of visibility
  useEffect(() => {
    layer["setVisible"](isVisible);
  }, [isVisible]);

  drag(drop(ref));

  return (
    <li
      className={clsx(
        "vkf-layermanagement-record",
        isVisible ? "visible" : "notvisible",
        isDragging && "drag-and-drop-placeholder",
        hovered &&
          (draggedItem === null || draggedItem.id === layer.getId()) &&
          "force-hover"
      )}
      id={index}
      data-id={layer.getId()}
      data-handler-id={handlerId}
      onMouseEnter={handleMouseEnter}
      onMouseOver={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={ref}
    >
      <div className="control-container">
        <button
          className="move-layer-top minimize-tool"
          onClick={handleMoveTop}
          type="button"
          title={translate("factory-move-top")}
        >
          {translate("factory-move-top")}
        </button>
        <button
          className="disable-layer minimize-tool"
          onClick={handleChangeVisibility}
          type="button"
          title={translate("factory-show-map")}
        >
          {translate("factory-show-map")}
        </button>
        <button
          className="remove-layer minimize-tool"
          onClick={handleRemoveLayer}
          type="button"
          title={translate("factory-rm-map")}
        >
          {translate("factory-rm-map")}
        </button>
        <button
          className="zoom-layer minimize-tool"
          onClick={handleZoomToExtent}
          type="button"
          title={translate("factory-zoom-to-map")}
        >
          {translate("factory-zoom-to-map")}
        </button>
        <button
          className="show-original"
          onClick={handleOriginalMap}
          type="button"
          title={translate("factory-show-original")}
        >
          {translate("factory-show-original")}
        </button>
        <div className="drag-btn" />
        {settings["LINK_TO_GEOREFERENCE"] !== undefined && (
          <a
            className="georeference-update"
            title={`${translate("georef-update")} ...`}
            target="_blank"
            rel="noreferrer"
            href={`${settings["LINK_TO_GEOREFERENCE"]}?map_id=${layer.getId()}`}
          >
            ${translate("georef-update")} ...
          </a>
        )}
      </div>
      <a href="#" className="thumbnail">
        <img onError={handleError} src={src} alt="Thumbnail Image of Map" />
      </a>
      <div className="metadata-container">
        <h4>{layer.getTitle()}</h4>
        <div className="timestamps">
          <span className="timestamps-label">{`${translate(
            "timestamp"
          )} ${layer.getTimePublished()}`}</span>
        </div>
      </div>
      <OpacitySlider orientation="vertical" layer={layer} />
    </li>
  );
};

LayerManagementEntry.propTypes = {
  hovered: PropTypes.bool,
  id: PropTypes.string,
  index: PropTypes.number,
  layer: PropTypes.instanceOf(HistoricMap),
  onMoveLayer: PropTypes.func,
  onUpdateHover: PropTypes.func,
};

export default LayerManagementEntry;
