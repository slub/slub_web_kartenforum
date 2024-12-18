/**
 * Created by nicolas.looschen@pikobytes.de on 01.12.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { useRecoilValue } from "recoil";
import { vectorMapActiveVersionDrawState } from "@map/atoms";

import React from "react";
import VersionHistoryEntry from "@map/components/GeoJson/GeoJsonHistoryPanel/components/VersionHistory/VersionHistoryEntry";
import useVectorMapVersionsQuery from "../../useVectorMapVersionsQuery";

export const VersionHistory = () => {
  const activeVersion = useRecoilValue(vectorMapActiveVersionDrawState);
  const vectorMapVersions = useVectorMapVersionsQuery();

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
