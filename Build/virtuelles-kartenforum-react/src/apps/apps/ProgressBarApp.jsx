/**
 * Created by jacob.mendt@pikobytes.de on 24.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { queryStatistics } from "../../util/apiGeo";
import SettingsProvider from "../../SettingsProvider";
import "./ProgressBarApp.scss";

/**
 * @param {*} props
 * @returns {JSX.Element}
 * @constructor
 */
function ProgressText(props) {
  const marginLeft = `-${props.progress}%`;
  if (props.languageCode === "de") {
    return (
      <div style={{ marginLeft: marginLeft }}>
        Bereits <b>{props.mapsDone}</b> von <b>{props.totalPoints}</b> Karten
        georeferenziert.
      </div>
    );
  } else {
    return (
      <div style={{ marginLeft: marginLeft }}>
        Already <b>{props.mapsDone}</b> of <b>{props.totalPoints}</b> maps
        georeferenced.
      </div>
    );
  }
}

ProgressText.propTypes = {
  languageCode: PropTypes.oneOf(["de", "en"]),
  mapsDone: PropTypes.number,
  progress: PropTypes.number,
  totalPoints: PropTypes.number,
};

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

  console.log(statistics);
  return (
    <div className="vkf-apps-progressbar">
      {statistics !== null && (
        <div>
          <div className="progressbar-container">
            <div className="text">
              <ProgressText {...statistics} languageCode={languageCode} />
            </div>
            <div className="bar">
              <div
                className="done"
                style={{ width: `${statistics.progress}%` }}
              ></div>
              <div
                className="todo"
                style={{ marginLeft: `${statistics.progress}%` }}
              ></div>
            </div>
          </div>
          <div className="overview-ranking">
            <div>
              <p>
                {languageCode === "de"
                  ? "Die Top-Georeferenzierer:"
                  : "The Top-Georeferencer:"}
              </p>
              <ol>
                {statistics.ranking.length > 3 && (
                  <span className="further-items">[...]</span>
                )}
                {statistics.ranking.slice(0, 3).map((u, i) => (
                  <li key={i}>
                    <span>
                      <b>{u.user_id}:</b> {u.total_points}{" "}
                      {languageCode === "de" ? "Punkte" : "points"}
                    </span>
                  </li>
                ))}
              </ol>
              <div className="forwarding">
                <p>
                  {languageCode === "de"
                    ? "Jetzt mithelfen und selbst Punkte sammeln."
                    : "Take part and collect points."}
                </p>
                <a
                  title="Frequently Asked Questions (FAQ)"
                  href={SettingsProvider.getSettings().LINK_TO_FAQ}
                >
                  {languageCode === "de" ? "So einfach geht's" : "Start now."}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressBarApp;
