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

import { isDefined, translate } from "../../../../../util/util";
import {
  mapState,
  olcsMapState,
  selectedFeaturesState,
  selectedOriginalMapIdState,
} from "../../../atoms/atoms";
import { OpacitySlider } from "../OpacitySlider/OpacitySlider";
import { FALLBACK_SRC } from "../../MapSearch/components/MapSearchListElement/MapSearchListElement";
import HistoricMap from "../../CustomLayers/HistoricMapLayer";
import SettingsProvider from "../../../../../SettingsProvider";
import { serializeOperationalLayer } from "../../../persistence/util";
import { triggerJsonDownload } from "../util";
import { LAYER_TYPES } from "../../CustomLayers/LayerTypes";
import { useDoubleTap } from "use-double-tap";
import SvgIcons from "../../../../../components/SvgIcons/SvgIcons.jsx";
import "./LayerManagementEntry.scss";

export const ItemTypes = {
  LAYER: "LAYER",
};

export const LayerManagementEntry = (props) => {
  const { hovered, id, index, layer, onMoveLayer, onUpdateHover } = props;
  const map = useRecoilValue(mapState);
  const olcsMap = useRecoilValue(olcsMapState);
  const ref = useRef(null);
  const [selectedFeatures, setSelectedFeatures] = useRecoilState(
    selectedFeaturesState
  );
  const setSelectedOriginalMapId = useSetRecoilState(
    selectedOriginalMapIdState
  );
  const [src, setSrc] = useState(layer.getThumbnail());
  const [isVisible, setIsVisible] = useState(layer["getVisible"]());
  const [isShowActions, setShowActions] = useState();
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

  // triggers the download of a geojson file name like the clicked layer
  const handleExportGeojson = () => {
    const id = layer.getId();
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
    if (draggedItem === null && !hovered) {
      onUpdateHover(layer.getId());
      setShowActions(!isShowActions);
    }
  };

  // reset hovered layer id if no drag is in progress
  const handleMouseLeave = () => {
    if (draggedItem === null) {
      onUpdateHover(undefined);
      setShowActions(undefined);
    }
  };

  // toggle function buttons on double click/tap
  const handleDoubleTap = useDoubleTap((event) => {
    setShowActions(!isShowActions);
  });

  // Move layer to the top of the stack
  const handleMoveTop = (event) => {
    map.removeLayer(layer);
    map.addLayer(layer);
    event.stopPropagation();
    if (olcsMap !== undefined) {
      olcsMap.getAutoRenderLoop().restartRenderLoop();
    }
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

    if (olcsMap !== undefined) {
      olcsMap.getAutoRenderLoop().restartRenderLoop();
    }
  };

  // Update visibility from layer if it is different from the internal state
  const handleUpdateVisibility = () => {
    const layerVisibility = layer["getVisible"]();
    if (layerVisibility !== isVisible) setIsVisible(layerVisibility);
  };

  // zoom to the layer
  const handleZoomToExtent = () => {
    if (isDefined(map)) {
      const extent =
        layer.get("type") === LAYER_TYPES.GEOJSON
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
        isVisible ? "record-visible" : "record-hidden",
        isDragging && "drag-and-drop-placeholder",
        isShowActions && "show-actions",
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
      {...handleDoubleTap}
      ref={ref}
    >
      <div className="visibility-container">
        <button
          className="disable-layer minimize-tool"
          onClick={handleChangeVisibility}
          type="button"
          title={translate("layermanagement-show-map")}
        >
          {translate("layermanagement-show-map")}
        </button>
      </div>
      {layer.get("type") !== LAYER_TYPES.GEOJSON && (
        <div className="thumbnail-container">
          <a href="#">
            <img onError={handleError} src={src} alt="Thumbnail Image of Map" />
          </a>
        </div>
      )}
      <div className="metadata-container">
        <h4>{layer.getTitle()}</h4>
        <div className="timestamps">
          <span className="timestamps-label">{`${translate(
            "layermanagement-timestamp"
          )} ${layer.getTimePublished()}`}</span>
        </div>
      </div>
      <div className="control-container">
        <button
          className="move-layer-top minimize-tool"
          onClick={handleMoveTop}
          type="button"
          title={translate("layermanagement-move-top")}
        >
          <SvgIcons name="layeraction-totop" />
          {translate("layermanagement-move-top")}
        </button>
        <button
          className="remove-layer minimize-tool"
          onClick={handleRemoveLayer}
          type="button"
          title={translate("layermanagement-remove-map")}
        >
          <SvgIcons name="layeraction-remove-map" />
          {translate("layermanagement-remove-map")}
        </button>
        <button
          className="zoom-layer minimize-tool"
          onClick={handleZoomToExtent}
          type="button"
          title={translate("layermanagement-zoom-to-map")}
        >
          <SvgIcons name="layeraction-center" />
          {translate("layermanagement-zoom-to-map")}
        </button>
        {layer.get("type") !== LAYER_TYPES.GEOJSON ? (
          <button
            className="show-original"
            onClick={handleOriginalMap}
            type="button"
            title={translate("layermanagement-show-original")}
          >
            <SvgIcons name="layeraction-showoriginal" />
            {translate("layermanagement-show-original")}
          </button>
        ) : (
          <button
            className="export-geojson"
            onClick={handleExportGeojson}
            type="button"
            title="export"
          >
            Export
          </button>
        )}
        {settings["LINK_TO_GEOREFERENCE"] !== undefined && (
          <button
            className="georeference-update"
            title={`${translate("layermangement-georef-update")} ...`}
            onClick={(e) => {
              window.open(
                `${settings["LINK_TO_GEOREFERENCE"]}?map_id=${layer.getId()}`,
                "_blank"
              );
            }}
          >
            <SvgIcons name="icon-point-move" />$
            {translate("layermangement-georef-update")}
          </button>
        )}
        <OpacitySlider orientation="horizontal" layer={layer} />
      </div>
      <div className="drag-container">
        <button className="drag-button">
          <span />
          <span />
          <span />
          <span />
        </button>
      </div>
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
  showActions: PropTypes.func,
};

export default LayerManagementEntry;