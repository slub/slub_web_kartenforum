/**
 * Created by nicolas.looschen@pikobytes.de on 10/3/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { transform } from "ol/proj";
import { useRecoilValue } from "recoil";

import { isDefined, translate } from "../../util/util";
import { mapState } from "../../atoms/atoms";
import { Autocomplete } from "./Autocomplete/Autocomplete";
import "./GazetteerSearch.scss";

export const GazetteerSearch = (props) => {
  const { projection, searchUrl } = props;

  const [isLoading, setIsLoading] = useState(false);
  const map = useRecoilValue(mapState);

  const placenameToString = (placename) => (placename ? placename.label : "");

  /**
   * @param {string} placename
   * @param {Function} callback
   * @private
   */
  const requestPlacenameData = (
    placename,
    callback,
    loadingBehaviour = false
  ) => {
    const request_url = searchUrl + "?format=json&q=" + placename;

    if (loadingBehaviour) setIsLoading(true);

    axios.get(request_url).then((response) => {
      const data = response.data;
      const parsedData = data.map((feature) => ({
        label: feature["display_name"],
        value: feature["display_name"],
        lonlat: {
          x: parseFloat(feature["lon"]),
          y: parseFloat(feature["lat"]),
        },
        type: feature["type"],
      }));

      if (loadingBehaviour) setIsLoading(false);
      callback(parsedData);
    });
  };

  const updateMapView = function (feature, srs) {
    const epsg = isDefined(srs) ? srs : "EPSG:4326";
    const lonlat = [feature["lonlat"]["x"], feature["lonlat"]["y"]];

    const center = transform(
      [parseFloat(lonlat[0]), parseFloat(lonlat[1])],
      epsg,
      projection
    );

    map.getView().setCenter(center);
    map.getView().setZoom(12);
  };

  const handleSubmitPlaceName = (selectedItem, inputValue) => {
    if (selectedItem !== undefined) {
      updateMapView(selectedItem);
    } else {
      requestPlacenameData(inputValue, (data) => {
        if (data.length > 0) {
          updateMapView(data[0]);
        } else {
          // @TODO: ADD TRANSLATION
          alert("The choosen placename is unknown");
        }
      });
    }
  };

  return (
    <div className="gazetteersearch-container">
      <Autocomplete
        buttonProps={{
          className: "form-control gazetteersearch-submit",
          onClick: handleSubmitPlaceName,
          "aria-label": translate("gazetteer-submit"),
        }}
        fetchInputItems={requestPlacenameData}
        inputProps={{
          className: `form-control gazetteersearch-input ${
            isLoading ? "loading" : ""
          }`,
          placeholder: translate("gazetteer-placeholder"),
        }}
        itemToString={placenameToString}
        onSelectedItemChange={handleSubmitPlaceName}
      />
    </div>
  );
};

GazetteerSearch.propTypes = {
  projection: PropTypes.string,
  searchUrl: PropTypes.string,
};

export default GazetteerSearch;
