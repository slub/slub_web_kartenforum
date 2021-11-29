/**
 * Created by jacob.mendt@pikobytes.de on 25.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useEffect, useState } from "react";
import { queryStatistics } from "../../util/apiGeo";
import { translate } from "../../util/util";
import "./GeoreferenceRanking.scss";

export const GeoreferenceRanking = () => {
  const [ranking, setRanking] = useState([]);

  // Effects
  useEffect(() => {
    const fetchData = async () => {
      const newStatistics = await queryStatistics();
      setRanking(newStatistics.georeference_points);
    };

    fetchData();
  }, []);

  return (
    <div className="vkf-apps-georeferenceranking">
      <table className="table">
        <thead>
          <tr>
            <th>{translate("georeferenceranking-label-place")}</th>
            <th>{translate("georeferenceranking-label-user")}</th>
            <th>{translate("georeferenceranking-label-transformation-new")}</th>
            <th>
              {translate("georeferenceranking-label-transformation-update")}
            </th>
            <th>{translate("georeferenceranking-label-points")}</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((r, i) => (
            <tr key={i}>
              <th className="rank">{i + 1}</th>
              <th className="user">{r.user_id}</th>
              <th className="transformation-new">{r.transformation_new}</th>
              <th className="transformation-update">
                {r.transformation_updates}
              </th>
              <th className="points">{r.total_points}</th>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GeoreferenceRanking;
