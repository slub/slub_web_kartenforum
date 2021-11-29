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
import { SettingsProvider } from "../georeferencer";
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
      <div>
        <header>
          <h1>
            {translate("userhistory-title")} #{userName}
          </h1>
          <h2>
            {translate("userhistory-subtitle")}: {history.points}
          </h2>
        </header>
        <section className="content-container">
          <div>
            {history.maps.map((map, i) => (
              <div key={i} className="map-item">
                <div className="media">
                  <div className="media-img">
                    <img
                      alt="Map Image"
                      src={map.metadata.thumbnail}
                      loading="lazy"
                    />
                  </div>
                  <div className="media-body">
                    <h3>{map.metadata.title}</h3>
                    <p>
                      <strong>{translate("userhistory-label-mapId")}:</strong>{" "}
                      {map.map_id}
                    </p>
                    <p>
                      <strong>
                        {translate("userhistory-label-validation")}:
                      </strong>
                      <span
                        className={clsx(
                          "label",
                          VALIDATION_CLASSES[map.transformation.validation]
                        )}
                      >
                        {" "}
                        {map.transformation.validation}
                      </span>
                    </p>
                    <div className="link-container">
                      <a
                        href={`${linkToMain}?map_id=${map.map_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-default"
                      >
                        {translate("userhistory-link-showMap")}
                      </a>
                      <a
                        href={`${linkToGeoreference}?transformation_id=${map.transformation.id}`}
                        rel="noreferrer"
                        target="_blank"
                        className="btn btn-default"
                      >
                        {translate("userhistory-link-goToProcess")}
                      </a>
                    </div>
                    <p className="metadata">
                      Created: {map.transformation.submitted}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserHistory;
