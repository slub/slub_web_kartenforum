/**
 * Created by nicolas.looschen@pikobytes.de on 01.12.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { selector, useRecoilValue } from "recoil";
import {
  vectorMapActiveVersionDrawState,
  vectorMapDrawState,
} from "@map/atoms";
import { isDefined } from "@util/util";
import { getVectorMapVersions } from "@map/components/GeoJson/util/apiVectorMaps";
import React from "react";
import VersionHistoryEntry from "@map/components/GeoJson/GeoJsonHistoryPanel/components/VersionHistory/VersionHistoryEntry";

const vectorMapVersionsState = selector({
  key: "vectorMapVersionsState",
  get: async ({ get }) => {
    const vectorMap = get(vectorMapDrawState);

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
  const activeVersion = useRecoilValue(vectorMapActiveVersionDrawState);
  const vectorMapVersions = useRecoilValue(vectorMapVersionsState);

  if (!vectorMapVersions) {
    return null;
  }

  return (
    <ul className="version-history">
      {vectorMapVersions.map((version, index) => (
        <VersionHistoryEntry
          isMostRecent={index === 0}
          isSelected={
            activeVersion === null
              ? index === 0
              : activeVersion === version.version
          }
          key={version.version}
          version={version}
        />
      ))}
    </ul>
  );
};
export default VersionHistory;
