/**
 * Created by nicolas.looschen@pikobytes.de on 03.12.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useRef } from "react";
import { useRecoilState } from "recoil";
import { geoJsonLayerViewFullTextFilterState } from "@map/views/GeoJsonLayerView/atoms";
import { translate } from "@util/util";

import "./GeoJsonLayerFullTextSearch.scss";

export const GeoJsonLayerFullTextSearch = () => {
  const [fullTextFilter, setFullTextFilter] = useRecoilState(
    geoJsonLayerViewFullTextFilterState
  );

  const inputRef = useRef(null);

  const handleChange = useCallback((e) => {
    setFullTextFilter(e.target.value);
  }, []);

  const handleButtonClick = useCallback(() => {
    inputRef.current.focus();
    inputRef.current.select();
  }, []);

  return (
    <div className="gazetteersearch-container">
      <div className="form-group">
        <input
          className="form-control gazetteersearch-input"
          onChange={handleChange}
          ref={inputRef}
          value={fullTextFilter}
          placeholder={translate("geojsonlayerpanel-fulltext-placeholder")}
        />
        <button
          className="form-control gazetteersearch-submit"
          onClick={handleButtonClick}
        />
      </div>
    </div>
  );
};

export default GeoJsonLayerFullTextSearch;
