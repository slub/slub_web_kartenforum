/**
 * Created by nicolas.looschen@pikobytes.de on 10/3/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { useSetRecoilState } from "recoil";

import { notificationState } from "../../atoms/atoms.js";
import { translate } from "../../util/util.js";
import { Autocomplete } from "./Autocomplete/Autocomplete.jsx";
import { requestPlacenameData } from "./util.js";
import "./PlacenameSearch.scss";

const placenameToString = (placename) => (placename ? placename.label : "");

export const PlacenameSearch = (props) => {
  const { onSelectPosition, searchUrl } = props;
  const [isLoading, setIsLoading] = useState(false);
  const setNotification = useSetRecoilState(notificationState);

  ////
  // Handler section
  ////

  // Handler to fetch a list of options displayed in the autosuggest
  const handleFetchAutocompleteResults = useCallback(
    (placename) => {
      // start loading
      setIsLoading(true);
      // afterward finish loading
      return requestPlacenameData(searchUrl, placename, () => {
        setIsLoading(false);
      });
    },
    [searchUrl]
  );

  // Handler dispatching a mapview update based on the input
  const handleSubmitPlaceName = (selectedItem, inputValue) => {
    if (selectedItem !== undefined) {
      onSelectPosition(selectedItem);
    } else {
      requestPlacenameData(searchUrl, inputValue)
        .then((data) => {
          // select the first hit if there are any hits
          if (data.length > 0) {
            onSelectPosition(data[0]);
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
  onSelectPosition: PropTypes.func.isRequired,
  searchUrl: PropTypes.string.isRequired,
};

export default PlacenameSearch;
