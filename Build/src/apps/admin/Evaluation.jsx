/**
 * Created by jacob.mendt@pikobytes.de on 25.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState, useEffect } from "react";
import { transformExtent } from "ol/proj";
import SettingsProvider from "@settings-provider";
import Map2D from "@components/Map2D";
import LoadingBar from "@components/LoadingBar";
import { queryTransformationPreview } from "@util/apiGeo";
import LayerRectifiedImage from "@components/LayerRectifiedImage";
import SelectTransformations from "./components/SelectTransformations/SelectTransformations";
import TransformationItem from "./components/TransformationItem/TransformationItem";
import "./Evaluation.scss";

export const Evaluation = () => {
  const [transformations, setTransformations] = useState([]);
  const [currentPreview, setCurrentPreview] = useState(null);
  const [map2D, setMap2D] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function for handling the preview click
  const handleClickPreview = async (transformation) => {
    if (!isLoading) {
      setIsLoading(true);
      const response = await queryTransformationPreview(
        transformation.transformation_id
      );

      setCurrentPreview(
        Object.assign(response, {
          transformation_id: transformation.transformation_id,
        })
      );
      setIsLoading(false);
    }
  };

  // Focus map if new preview is set
  useEffect(() => {
    if (currentPreview !== null && map2D !== null) {
      const zoomExtent = transformExtent(
        currentPreview.extent,
        "EPSG:4326",
        map2D.map.getView().getProjection()
      );
      map2D.map.getView().fit(zoomExtent, {
        padding: [100, 100, 100, 100],
      });
    }
  }, [currentPreview, map2D]);

  return (
    <div className="vkf-admin-evaluation">
      <h1>
        Willkommen auf der Evaluierungsseite #{SettingsProvider.getUsername()}
      </h1>
      <p>
        Die Evaluierungsseite bietet Ihnen die Möglichkeit bestehende
        Transformationen zu validieren und ggf. zurückzusetzen. Sie können
        Transformationen nach unterschiedlichen Kriterien auswählen.
      </p>
      <SelectTransformations onChangeTransformations={setTransformations} />
      <div className="content">
        <div className="row">
          <div className="col-sm-6 col-md-6 col-lg-6 view-col">
            <div>
              {transformations.map((t) => (
                <TransformationItem
                  isActive={
                    currentPreview !== null &&
                    currentPreview.transformation_id === t.transformation_id
                  }
                  key={t.transformation_id}
                  data={t}
                  onClickPreview={handleClickPreview}
                />
              ))}
            </div>
          </div>
          <div className="col-sm-6 col-md-6 col-lg-6 view-col">
            <div className="custom-map-container">
              <Map2D
                extent={null}
                onLoad={(o) => setMap2D(o)}
                urlsOsmBaseMap={SettingsProvider.getDefaultBaseMapUrls()}
                urlNominatim={SettingsProvider.getNominatimUrl()}
              />

              {currentPreview !== null && map2D !== null && (
                <LayerRectifiedImage
                  key={currentPreview.wms_url}
                  map={map2D.map}
                  layerName={currentPreview.layer_name}
                  wmsUrl={currentPreview.wms_url}
                />
              )}
              {isLoading && <LoadingBar />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Evaluation;
