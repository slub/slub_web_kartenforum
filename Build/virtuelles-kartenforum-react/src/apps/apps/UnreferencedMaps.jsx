/**
 * Created by jacob.mendt@pikobytes.de on 25.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useState, useRef } from "react";
import { queryUnreferencedDocuments } from "../../util/apiEs";
import { translate } from "../../util/util";
import SettingsProvider from "../../SettingsProvider";

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
      <div>
        <header>
          <h1>
            {translate("unreferencedmaps-title")} #{userName}
          </h1>
          <h2>
            {translate("unreferencedmaps-subtitle")}: {maps.length}
          </h2>
        </header>
        <div className="form-group">
          <input
            value={searchValue}
            onChange={onChangeSearchInput}
            type="text"
            className="form-control"
            placeholder={translate("unreferencedmaps-search-placeholder")}
          />
        </div>
        <section className="content-container">
          <ul>
            {filteredMaps.map((map, i) => (
              <li key={i} className="map-item container">
                <div>
                  <div className="image">
                    <img alt="Map Image" src={map.thumb_url} loading="lazy" />
                  </div>
                  <div className="metadata">
                    <p>
                      <strong>{map.title}</strong>
                    </p>
                    <p>
                      {translate("unreferencedmaps-label-time")}:{" "}
                      {map.time_published}
                    </p>
                    <p>
                      {translate("unreferencedmaps-label-maptype")}:{" "}
                      {map.map_type}
                    </p>
                  </div>
                  <div className="controls">
                    <a
                      href={`${linkToGeoreference}?map_id=${map.map_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary"
                    >
                      {translate("unreferencedmaps-btn-georeference")}
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default UnreferencedMaps;
