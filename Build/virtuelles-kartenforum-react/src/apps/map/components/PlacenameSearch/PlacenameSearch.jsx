/**
 * Created by nicolas.looschen@pikobytes.de on 10/3/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useState } from "react";
import PropTypes from "prop-types";
import { transform } from "ol/proj";
import { useRecoilValue, useSetRecoilState } from "recoil";

import { notificationState } from "../../../../atoms/atoms";
import { isDefined, translate } from "../../../../util/util";
import { mapState } from "../../atoms/atoms";
import { Autocomplete } from "./Autocomplete/Autocomplete";
import { requestPlacenameData } from "./util";
import "./PlacenameSearch.scss";

export const PlacenameSearch = (props) => {
  const { projection, searchUrl } = props;

  const [isLoading, setIsLoading] = useState(false);
  const map = useRecoilValue(mapState);
  const setNotification = useSetRecoilState(notificationState);

  const placenameToString = (placename) => (placename ? placename.label : "");

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

  ////
  // Handler section
  ////

  // Handler to fetch a list of options displayed in the autosuggest
  const handleFetchAutocompleteResults = (placename) => {
    // start loading
    setIsLoading(true);
    // afterwards finish loading
    return requestPlacenameData(searchUrl, placename, () => {
      setIsLoading(false);
    });
  };

  // Handler dispatching a mapview update based on the input
  const handleSubmitPlaceName = (selectedItem, inputValue) => {
    if (selectedItem !== undefined) {
      updateMapView(selectedItem);
    } else {
      requestPlacenameData(searchUrl, inputValue)
        .then((data) => {
          // select the first hit if there are any hits
          if (data.length > 0) {
            updateMapView(data[0]);
          } else {
            throw new Error(translate("placenamesearch-unknown-placename"));
          }
        })
        .catch(() => {
          setNotification({
            id: "placenamesearch",
            type: "warning",
            text: translate("placenamesearch-unknown-placename"),
          });
        });
    }
  };

  return (
    <div className="gazetteersearch-container">
      <Autocomplete
        buttonProps={{
          className: "form-control gazetteersearch-submit",
          onClick: handleSubmitPlaceName,
          "aria-label": translate("placenamesearch-submit"),
          title: translate("placenamesearch-submit"),
        }}
        fetchInputItems={handleFetchAutocompleteResults}
        inputProps={{
          className: `form-control gazetteersearch-input ${
            isLoading ? "loading" : ""
          }`,
          placeholder: translate("placenamesearch-placeholder"),
        }}
        itemToString={placenameToString}
        onSelectedItemChange={handleSubmitPlaceName}
      />
    </div>
  );
};

PlacenameSearch.propTypes = {
  projection: PropTypes.string,
  searchUrl: PropTypes.string,
};

export default PlacenameSearch;
