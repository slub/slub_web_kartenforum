/**
 * Created by nicolas.looschen@pikobytes.de on 10.09.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { activeBasemapIdState, mapState } from "../../atoms/atoms.js";
import { isDefined, translate } from "../../../../util/util.js";
import customEvents from "../MapWrapper/customEvents.js";
import { BASEMAP_SELECTOR_CONTROL_ID } from "../Controls/BasemapSelectorControl.jsx";
import { createPortal } from "react-dom";
import { notificationState } from "../../../../atoms/atoms.js";
import BasemapSelector from "./BasemapSelector.jsx";

// Basemap list
const BASEMAPS = [
  {
    id: "slub-osm",
    label: "SLUB OSM",
    urls: [
      "https://tile-2.kartenforum.slub-dresden.de/styles/maptiler-basic-v2/style.json",
    ],
    type: "vector",
    tileSize: 512,
    vkf_type: "basemap",
  },
  {
    id: "bkg-topoplus",
    label: "BKG TopPlusOpen",
    urls: ["https://sgx.geodatenzentrum.de/wms_topplus_open"],
    type: "wms",
    layers: "web",
    tileSize: 512,
    vkf_type: "basemap",
  },
];
export const NewBasemapSelector = () => {
  const map = useRecoilValue(mapState);
  const [activeBasemapId, setActiveBasemapId] =
    useRecoilState(activeBasemapIdState);
  const setNotification = useSetRecoilState(notificationState);

  const [baseMapControlEl, setBaseMapControlEl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeBasemap, setActiveBasemap] = useState(BASEMAPS[0]);

  useEffect(() => {
    if (isDefined(map)) {
      const handleAddControl = (e) => {
        if (e.control?.id === BASEMAP_SELECTOR_CONTROL_ID) {
          setBaseMapControlEl(e.control._container);
        }
      };

      const handleRemoveControl = (e) => {
        if (e.control?.id === BASEMAP_SELECTOR_CONTROL_ID) {
          setBaseMapControlEl(null);
        }
      };

      map.on(customEvents.controlAdded, handleAddControl);
      map.on(customEvents.controlRemoved, handleRemoveControl);

      return () => {
        map.off(customEvents.controlAdded, handleAddControl);
        map.off(customEvents.controlRemoved, handleRemoveControl);
      };
    }
  }, [map, isModalOpen]);

  // update active basemap
  const handleBasemapChange = (newBasemapLayer) => {
    setActiveBasemapId(newBasemapLayer.id);
    setActiveBasemap(newBasemapLayer);
  };

  return baseMapControlEl !== null
    ? createPortal(
        <>
          <button
            onClick={() => setIsModalOpen(!isModalOpen)}
            title={translate("control-basemapselector-open")}
          ></button>
          {isModalOpen && (
            <div
              className={`basemap-selector-modal ${
                isModalOpen ? "active" : "inactive"
              }`}
            >
              <BasemapSelector
                map={map}
                onBasemapChange={handleBasemapChange}
                onSetNotification={setNotification}
                forceBasemapId={activeBasemap.id}
              />
            </div>
          )}
        </>,
        baseMapControlEl
      )
    : null;
};

export default NewBasemapSelector;
