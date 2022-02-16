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
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th className="rank">
                {translate("georeferenceranking-label-place")}
              </th>
              <th className="user">
                {translate("georeferenceranking-label-user")}
              </th>
              <th className="transformation-new">
                {translate("georeferenceranking-label-transformation-new")}
              </th>
              <th className="transformation-update">
                {translate("georeferenceranking-label-transformation-update")}
              </th>
              <th className="points">
                {translate("georeferenceranking-label-points")}
              </th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((r, i) => (
              <tr key={i}>
                <td className="rank">{i + 1}</td>
                <td className="user">{r.user_id}</td>
                <td className="transformation-new">{r.transformation_new}</td>
                <td className="transformation-update">
                  {r.transformation_updates}
                </td>
                <td className="points">{r.total_points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GeoreferenceRanking;
