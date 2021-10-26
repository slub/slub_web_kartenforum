/**
 * Created by nicolas.looschen@pikobytes.de on 21.10.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import { translate } from "../../util/util";
import { useEffect, useState } from "react";
import { FALLBACK_SRC } from "../MapSearch/MapSearchListElement";
import { useRecoilValue } from "recoil";
import { mapState } from "../../atoms/atoms";
import { OpacitySlider } from "./OpacitySlider";

export const LayerManagementEntry = (props) => {
  const { index, layer } = props;
  const map = useRecoilValue(mapState);
  const [src, setSrc] = useState(layer.getThumbnail());
  const [isVisible, setIsVisible] = useState(layer["getVisible"]());

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
    // @TODO: REFRESH 3D VIEW HERE
    // vk2.utils.refresh3DView();
  };

  const handleUpdateVisibility = () => {
    const layerVisibility = layer["getVisible"]();
    if (layerVisibility !== isVisible) setIsVisible(layerVisibility);
  };

  useEffect(() => {
    layer.on("change:visible", handleUpdateVisibility);
    return () => {
      layer.un("change:visible", handleUpdateVisibility);
    };
  });

  useEffect(() => {
    layer["setVisible"](isVisible);
  }, [isVisible]);

  return (
    <li
      className={`layermanagement-record ${
        isVisible ? "visible" : "notvisible"
      }`}
      id={index}
      data-id={layer.getId()}
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

export default LayerManagementEntry;

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
