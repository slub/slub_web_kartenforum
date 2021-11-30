/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { useDrag, useDrop } from "react-dnd";
import PropTypes from "prop-types";

import { translate } from "../../util/util";
import { mapState, selectedFeaturesState } from "../../atoms/atoms";
import { OpacitySlider } from "./OpacitySlider";
import { FALLBACK_SRC } from "../MapSearch/MapSearchListElement";
import HistoricMap from "../layer/HistoricMapLayer";
import SettingsProvider from "../../SettingsProvider";

export const ItemTypes = {
  LAYER: "LAYER",
};

export const LayerManagementEntry = (props) => {
  const { id, index, layer, onMoveLayer } = props;
  const map = useRecoilValue(mapState);
  const ref = useRef(null);
  const [selectedFeatures, setSelectedFeatures] = useRecoilState(
    selectedFeaturesState
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

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.LAYER,
    item: () => {
      return { id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  ////
  // Handler section
  ////

  const handleError = () => {
    if (src !== FALLBACK_SRC) {
      setSrc(FALLBACK_SRC);
    }
  };

  const handleChangeVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleMoveTop = (event) => {
    map.removeLayer(layer);
    map.addLayer(layer);
    event.stopPropagation();
    // @TODO: REFRESH 3D VIEW HERE
    // vk2.utils.refresh3DView();
  };

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

  const handleUpdateVisibility = () => {
    const layerVisibility = layer["getVisible"]();
    if (layerVisibility !== isVisible) setIsVisible(layerVisibility);
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

  // Hide dragged item on drag
  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  return (
    <li
      className={`layermanagement-record ${
        isVisible ? "visible" : "notvisible"
      }`}
      id={index}
      data-id={layer.getId()}
      data-handler-id={handlerId}
      style={{ opacity }}
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
        <div className="drag-btn" />
        <a
          className="georeference-update"
          title={`${translate("georef-update")} ...`}
          target="_blank"
          href={`${settings["LINK_TO_GEOREFERENCE"]}?map_id=${layer.getId()}`}
        >
          ${translate("georef-update")} ...
        </a>
      </div>
      <a href="#" className="thumbnail">
        <img onError={handleError} src={src} alt="Thumbnail Image of Map" />
      </a>
      <div className="metadata-container">
        <h4>{layer.getTitle()}</h4>
        <div className="timestamps">
          <span className="timestamps-label">{`${translate(
            "timestamp"
          )} ${layer.getTime()}`}</span>
        </div>
      </div>
      <OpacitySlider orientation="vertical" layer={layer} />
    </li>
  );
};

LayerManagementEntry.propTypes = {
  id: PropTypes.string,
  index: PropTypes.number,
  layer: PropTypes.instanceOf(HistoricMap),
  onMoveLayer: PropTypes.func,
};

export default LayerManagementEntry;

// @TODO: PORT THIS ?
// // add update georeference anchor if login
// if (goog.net.cookies.get("vk2-auth")) {
//   var anchorGeoreferenceUpdate = goog.dom.createDom("a", {
//     class: "georeference-update",
//     title: vk2.utils.getMsg("factory-update-georef") + " ...",
//     innerHTML: vk2.utils.getMsg("factory-update-georef") + " ...",
//     target: "_blank",
//     href: vk2.utils.routing.getGeorefPageRoute(layer.getId()),
//   });
//   goog.dom.appendChild(controlContainer, anchorGeoreferenceUpdate);
// }
