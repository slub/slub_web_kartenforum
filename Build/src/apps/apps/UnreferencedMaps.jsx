/**
 * Created by jacob.mendt@pikobytes.de on 25.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useState, useRef } from "react";
import { queryUnreferencedDocuments } from "@util/apiEs";
import { translate } from "@util/util";
import SettingsProvider from "@settings-provider";

import "./UnreferencedMaps.scss";

export const UnreferencedMaps = () => {
  const [maps, setMaps] = useState([]);
  const [filteredMaps, setFilteredMaps] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const userName = SettingsProvider.getSettings().USERNAME;
  const linkToGeoreference =
    SettingsProvider.getSettings().LINK_TO_GEOREFERENCE;
  const refTimeout = useRef(null);

  // Handler
  const onChangeSearchInput = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);

    // Filter the maps data and use a timeout
    if (refTimeout.current !== null) {
      clearTimeout(refTimeout.current);
      refTimeout.current = null;
    }

    refTimeout.current = setTimeout(() => {
      setFilteredMaps(
        maps.filter((m) =>
          m.title.toLowerCase().includes(newValue.toLowerCase())
        )
      );
    }, 200);
  };

  // Effects
  useEffect(() => {
    const fetchData = async () => {
      const newMaps = await queryUnreferencedDocuments();
      setMaps(newMaps);
      setFilteredMaps(newMaps);
    };

    fetchData();
  }, []);

  return (
    <div className="vkf-apps-unreferenced-maps">
      <h3>
        {translate("unreferencedmaps-title")} #{userName}
      </h3>
      <span className="status-feedback">
        {translate("unreferencedmaps-subtitle")}: {maps.length}
      </span>
      <div className="quick-search">
        <label htmlFor="quick-search-field">
          {translate("unreferencedmaps-search-placeholder")}
        </label>
        <input
          id="quick-search-field"
          value={searchValue}
          onChange={onChangeSearchInput}
          type="text"
          placeholder={translate("unreferencedmaps-search-placeholder")}
        />
      </div>
      <ul className="maps-list">
        {filteredMaps.map((map, i) => (
          <li key={i} className="map-item">
            <figure className="map-image">
              <a
                href={`${linkToGeoreference}?map_id=${map.map_id}`}
                target="_blank"
                rel="noreferrer"
              >
                <img alt="Map Image" src={map.thumb_url} loading="lazy" />
              </a>
            </figure>
            <div className="map-meta">
              <h4>{map.title}</h4>
              <p>
                <span className="map-meta-label">
                  {translate("unreferencedmaps-label-time")}:{" "}
                </span>
                <span className="map-meta-value">{map.time_published}</span>
              </p>
              <p>
                <span className="map-meta-label">
                  {translate("unreferencedmaps-label-maptype")}:{" "}
                </span>
                <span className="map-meta-value">{map.map_type}</span>
              </p>
              <p>
                <span className="map-meta-label">ID: </span>
                <span className="map-meta-value">{map.map_id}</span>
              </p>
            </div>
            <div className="map-links">
              <a
                href={`${linkToGeoreference}?map_id=${map.map_id}`}
                target="_blank"
                rel="noreferrer"
              >
                {translate("unreferencedmaps-btn-georeference")}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UnreferencedMaps;
