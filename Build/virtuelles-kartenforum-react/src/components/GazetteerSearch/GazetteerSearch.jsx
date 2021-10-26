/**
 * Created by nicolas.looschen@pikobytes.de on 10/3/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { isDefined, translate } from "../../util/util";
import { useRecoilValue } from "recoil";
import { mapState } from "../../atoms/atoms";
import { transform } from "ol/proj";

export const GazetteerSearch = (props) => {
  const { projection, searchUrl } = props;

  const map = useRecoilValue(mapState);
  const inputRef = useRef();

  const updateMapView = function (feature, srs) {
    const epsg = isDefined(srs) ? srs : "EPSG:4326";
    const lonlat = [feature["lonlat"]["x"], feature["lonlat"]["y"]];

    const center = transform(
      [parseFloat(lonlat[0]), parseFloat(lonlat[1])],
      epsg,
      projection
    );

    map.getView().setCenter(center);
    map.getView().setZoom(6);
  };

  /**
   * @param {string} placename
   * @param {Function} callback
   * @private
   */
  const requestPlacenameData = (placename, callback) => {
    // set loading when this is done

    const request_url = searchUrl + "?format=json&q=" + placename;
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
      callback(parsedData);
    });
    // unset loading
  };

  const submitHandler = {
    /**
     * @param {string} placename
     */
    placename: function (placename) {
      // get actual input field content
      if (this._actualAutoCompleteData.hasOwnProperty(placename)) {
        this._createJumpToEvent(this._actualAutoCompleteData[placename][0]);
        return undefined;
      }

      requestPlacenameData(placename, function (data) {
        if (data.length > 0) {
          updateMapView(data[0]);
        } else {
          alert("The choosen placename is unknown.");
        }
      });
    },
  };

  const handleSubmitPlaceName = () => {
    const name = inputRef.current.value;
    const placename = name.indexOf(",") > -1 ? name.split(",")[0] : name;
    submitHandler["placename"](placename);
  };

  /**
   * This appends jquery autocomplete behavior to the gazetteersearch
   * @private
   */

  useEffect(() => {
    $(inputRef.current).autocomplete({
      source: (request, response) => {
        requestPlacenameData(request["term"], response);
        return undefined;
      },
      delay: 300,
      minLength: 3,
      autoFocus: true,
      select: (event, ui) => {
        updateMapView(ui["item"]);
      },
      open: function () {
        $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
      },
      close: function () {
        $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
      },
    });
  });

  return (
    <div className="gazetteersearch-container">
      <div className="form-group">
        <input
          className="form-control gazetteersearch-input"
          placeholder={translate("gazetteer-placeholder")}
          type="text"
          ref={inputRef}
        />
        <input
          className="form-control gazetteersearch-submit"
          onClick={handleSubmitPlaceName}
          type="submit"
          value={translate("gazetteer-submit")}
        />
      </div>
    </div>
  );
};

GazetteerSearch.propTypes = {
  searchUrl: PropTypes.string,
};

export default GazetteerSearch;
