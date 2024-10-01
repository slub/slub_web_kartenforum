/**
 * Created by jacob.mendt@pikobytes.de on 24.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useState } from "react";
import { queryStatistics } from "../../util/apiGeo";
import SettingsProvider from "../../SettingsProvider";
import "./ProgressBarApp.scss";

/**
 * This React components is bilingual and works with the language codes "en" and "de"
 * @returns {JSX.Element}
 * @constructor
 */
export const ProgressBarApp = () => {
  const [statistics, setStatistics] = useState(null);
  const languageCode = SettingsProvider.getSettings().LANGUAGE_CODE;

  useEffect(() => {
    const fetchData = async () => {
      const response = await queryStatistics();
      console.log(response);
      // Calculate relevant statistics
      const mapsDone = response.georeference_map_count;
      const mapsTodo = response.not_georeference_map_count;
      setStatistics({
        mapsDone,
        mapsTodo,
        progress: Math.floor((mapsDone / (mapsDone + mapsTodo)) * 100),
        ranking: response.georeference_points,
        totalPoints: mapsDone + mapsTodo,
      });
    };

    fetchData();
  }, [setStatistics]);

  return (
    <div className="vkf-apps-progressbar">
      {statistics !== null && (
        <div>
          <div className="progressbar-container">
            <h4>
              {languageCode === "de"
                ? "Fortschritt in der Georeferenzierung"
                : "Progress in georeferencing"}
            </h4>
            <p className="results">
              {languageCode === "de" ? (
                <span>
                  Bereits <strong>{statistics.mapsDone}</strong> von{" "}
                  <strong>{statistics.totalPoints}</strong> Karten
                  georeferenziert.
                </span>
              ) : (
                <span>
                  Already <strong>{statistics.mapsDone}</strong> of{" "}
                  <strong>{statistics.totalPoints}</strong> maps georeferenced.
                </span>
              )}
            </p>
            <div className="bar">
              <div
                className="done"
                style={{ width: `${statistics.progress}%` }}
              />
            </div>
          </div>
          <div className="overview-ranking">
            <div>
              <h4>
                {languageCode === "de"
                  ? "Die Top-Georeferenzierer"
                  : "The Top-Georeferencer"}
              </h4>
              <ol>
                {statistics.ranking.slice(0, 3).map((u, i) => (
                  <li key={i}>
                    <span>
                      <strong className="user">{u.user_id}:</strong>{" "}
                      {u.total_points}{" "}
                      {languageCode === "de" ? "Punkte" : "points"}
                    </span>
                  </li>
                ))}
                {statistics.ranking.length > 3 && (
                  <li className="further-items">[...]</li>
                )}
              </ol>
              <div className="forwarding">
                <p>
                  {languageCode === "de"
                    ? "Jetzt mithelfen und selbst Punkte sammeln."
                    : "Take part and collect points."}
                  &nbsp;
                  <a
                    title="Frequently Asked Questions (FAQ)"
                    href={SettingsProvider.getSettings().LINK_TO_FAQ}
                  >
                    {languageCode === "de" ? "So einfach geht's" : "Start now."}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressBarApp;
