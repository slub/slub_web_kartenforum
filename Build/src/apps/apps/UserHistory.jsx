/**
 * Created by jacob.mendt@pikobytes.de on 24.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { queryUserHistory } from "../../util/apiGeo";
import { translate } from "../../util/util";
import SettingsProvider from "../../SettingsProvider";
import "./UserHistory.scss";

const VALIDATION_CLASSES = {
  valid: "label-success",
  invalid: "label-warning",
  missing: "label-danger",
};

/**
 * Display the user history
 *
 * @TODO Implement lazy map loading
 * @returns {JSX.Element}
 * @constructor
 */
export const UserHistory = () => {
  const [history, setHistory] = useState({ maps: [], points: 0 });
  const userName = SettingsProvider.getSettings().USERNAME;
  const linkToGeoreference =
    SettingsProvider.getSettings().LINK_TO_GEOREFERENCE;
  const linkToMain = SettingsProvider.getSettings().LINK_TO_MAIN;

  useEffect(() => {
    const fetchData = async () => {
      const newHistory = await queryUserHistory();
      setHistory({
        maps: newHistory.georef_profile,
        points: newHistory.points,
      });
    };

    fetchData();
  }, []);

  return (
    <div className="vkf-apps-userhistory">
      <h3>
        {translate("userhistory-title")} #{userName}
      </h3>
      <span className="status-feedback">
        {translate("userhistory-subtitle")}: {history.points}
      </span>
      <ul className="maps-list">
        {history.maps.map((map, i) => (
          <li key={i} className="map-item">
            <figure className="map-image">
              <img
                alt="Map Image"
                src={map.metadata.thumbnail}
                loading="lazy"
              />
            </figure>
            <div className="map-meta">
              <h4>{map.metadata.title}</h4>
              <p>
                <span className="map-meta-label">Created: </span>
                <span className="map-meta-value">
                  {map.transformation.submitted}
                </span>
              </p>
              <p>
                <span className="map-meta-label">
                  {translate("userhistory-label-mapId")}:{" "}
                </span>
                <span className="map-meta-value">{map.map_id}</span>
              </p>
              <p>
                <span className="map-meta-label">
                  {translate("userhistory-label-validation")}:{" "}
                </span>
                <span
                  className={clsx(
                    "label",
                    VALIDATION_CLASSES[map.transformation.validation]
                  )}
                >
                  {map.transformation.validation}
                </span>
              </p>
            </div>
            <div className="map-links">
              <a
                href={`${linkToMain}?map_id=${map.map_id}`}
                target="_blank"
                rel="noreferrer"
              >
                {translate("userhistory-link-showMap")}
              </a>
              <a
                href={`${linkToGeoreference}?transformation_id=${map.transformation.id}&map_id=${map.map_id}`}
                rel="noreferrer"
                target="_blank"
              >
                {translate("userhistory-link-goToProcess")}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserHistory;
