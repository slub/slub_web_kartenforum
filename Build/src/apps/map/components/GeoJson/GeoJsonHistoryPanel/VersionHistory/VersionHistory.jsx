/**
 * Created by nicolas.looschen@pikobytes.de on 01.12.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { selector, useRecoilValue } from "recoil";
import { vectorMapDrawState } from "@map/atoms";
import { isDefined } from "@util/util";
import { getVectorMapVersions } from "@map/components/GeoJson/util/apiVectorMaps";
import React from "react";

const vectorMapVersionsState = selector({
  key: "vectorMapVersionsState",
  get: async ({ get }) => {
    const vectorMap = get(vectorMapDrawState);

    console.log(vectorMap);
    if (
      !isDefined(vectorMap) ||
      vectorMap.type === "local" ||
      vectorMap.id === null
    ) {
      return null;
    }

    return await getVectorMapVersions(vectorMap.id);
  },
});

export const VersionHistory = () => {
  const vectorMapVersions = useRecoilValue(vectorMapVersionsState);

  if (!vectorMapVersions) {
    return null;
  }

  return (
    <ul>
      {vectorMapVersions.map((version) => (
        <li
          key={version.version}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <span>{version.version}</span>
          <span>{version.submitted}</span>
          <span>{version.created_by}</span>
        </li>
      ))}
    </ul>
  );
};
export default VersionHistory;
