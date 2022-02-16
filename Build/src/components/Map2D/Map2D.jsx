/**
 * Created by jacob.mendt@pikobytes.de on 26.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import DragZoom from "ol/interaction/DragZoom";
import Fullscreen from "ol/control/FullScreen";
import { defaults as defaultInteractions } from "ol/interaction";
import Map from "ol/Map";
import Tile from "ol/layer/Tile";
import View from "ol/View";
import Zoom from "ol/control/Zoom";
import ZoomToExtent from "ol/control/ZoomToExtent";
import XYZ from "ol/source/XYZ";
import { transformExtent } from "ol/proj";
import { translate } from "../../util/util";
import LayerSpyControl from "../Controls/LayerSpyControl";
import "./Map2D.scss";

export const Map2D = (props) => {
  const {
    children,
    extent,
    onLoad = () =>
      console.log("No onLoad function was passed to component Map2D."),
    urlsOsmBaseMap,
  } = props;
  const refMapContainer = useRef(null);

  // Effect for initial loading of the georeference map
  useEffect(() => {
    const performInit = async () => {
      // Create the base layer
      const baseLayer = new Tile({
        source: new XYZ({
          urls: urlsOsmBaseMap,
          crossOrigin: "*",
          maxZoom: 18,
        }),
      });
      baseLayer.vkf_id = "slub-osm";

      // Create the map object
      const map = new Map({
        controls: [
          new Fullscreen({
            tipLabel: translate("control-fullscreen-title"),
          }),
          new Zoom({
            zoomInTipLabel: translate("control-zoom-in"),
            zoomOutTipLabel: translate("control-zoom-in"),
          }),
        ],
        interactions: defaultInteractions().extend([new DragZoom()]),
        layers: [baseLayer],
        target: refMapContainer.current,
        view: new View({
          projection: "EPSG:3857",
          center: [871713, 6396955],
          zoom: 4.3,
        }),
      });

      onLoad({
        map: map,
      });

      // Set extent if set
      if (extent !== undefined && extent !== null) {
        const targetExtent = transformExtent(
          extent,
          "EPSG:4326",
          map.getView().getProjection()
        );

        // Get extent of target source features and focus map to it
        map.getView().fit(targetExtent, {
          padding: [100, 100, 100, 100],
        });

        // Add a zoom to extent control
        map.addControl(
          new ZoomToExtent({
            tipLabel: translate("control-zoomtoextent-title"),
            extent: targetExtent,
          })
        );
      }

      // Add a layer spy control
      const spyLayer = new Tile({
        zIndex: 10,
        attribution: undefined,
        source: new XYZ({
          urls: urlsOsmBaseMap,
          crossOrigin: "*",
          attributions: [],
        }),
      });
      spyLayer.vkf_id = "slub-osm";
      map.addControl(
        new LayerSpyControl({
          spyLayer,
          refActiveBasemapId: { current: baseLayer.vkf_id },
        })
      );
    };

    if (refMapContainer.current !== null) {
      performInit();
    }
  }, []);

  return (
    <div className="map-container" ref={refMapContainer}>
      {children}
    </div>
  );
};

Map2D.propTypes = {
  // It is expected that the extent is passed in EPSG:4326
  extent: PropTypes.arrayOf(PropTypes.number),
  onLoad: PropTypes.func,
  urlNominatim: PropTypes.string,
  urlsOsmBaseMap: PropTypes.arrayOf(PropTypes.string),
};

export default Map2D;
