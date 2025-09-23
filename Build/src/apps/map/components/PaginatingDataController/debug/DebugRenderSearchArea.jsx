/**
 * Created by jacob.mendt@pikobytes.de on 08/19/25.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { mapState } from "@map/atoms";
import PropTypes from "prop-types";
import { useEffect } from "react";
import { useRecoilValue } from "recoil";

// Helper component for debugging the search geometries
export function DebugRenderSearchArea({ features }) {
  const map = useRecoilValue(mapState);

  useEffect(() => {
    if (!map || !features) return;

    // Prepare data
    const geojsonData = {
      type: "FeatureCollection",
      features: features,
    };

    const baseSourceId = "debug-search-source";
    const baseLayerId = "debug-search-layer";

    // Add source if it doesn't exist
    if (!map.getSource(baseSourceId)) {
      map.addSource(baseSourceId, {
        type: "geojson",
        data: geojsonData,
      });

      map.addLayer({
        id: `${baseLayerId}-polygon-fill`,
        type: "fill",
        source: baseSourceId,
        paint: {
          "fill-color": "#209173",
          "fill-opacity": 0.4,
        },
      });

      // Optional: Add an outline
      map.addLayer({
        id: `${baseLayerId}-polygon-outline`,
        type: "line",
        source: baseSourceId,
        paint: {
          "line-color": "#209173",
          "line-width": 2,
        },
      });

      // Add a layer to render the point
      map.addLayer({
        id: `${baseLayerId}-point`,
        type: "circle",
        source: baseSourceId,
        paint: {
          "circle-radius": 5,
          "circle-color": "#0f0f0f",
          "circle-stroke-width": 1,
          "circle-stroke-color": "#0f0f0f",
        },
      });
    } else {
      console.log("Zoom: ", map.getZoom());
      // If source exists, just update the data
      const source = map.getSource(baseSourceId);
      if (source) {
        console.log(geojsonData);
        source.setData(geojsonData);
      }
    }
  }, [map, features]);

  return null;
}

DebugRenderSearchArea.propTypes = PropTypes.array.isRequired;

export default DebugRenderSearchArea;
