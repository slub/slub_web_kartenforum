/**
 * Created by nicolas.looschen@pikobytes.de on 05.12.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import PropTypes from "prop-types";
import React, { useCallback } from "react";
import "./VersionHistoryEntry.scss";
import { formatShortDateTime } from "@map/components/GeoJson/util/formatters";
import clsx from "clsx";
import CustomButton from "@map/components/GeoJson/components/CustomButton";
import VkfIcon from "@components/VkfIcon";
import { useRestoreVectorMapVersion } from "@map/components/GeoJson/util/hooks/useRestoreVectorMapVersion";

export const VersionHistoryEntry = ({ isSelected, version, isMostRecent }) => {
  const restoreVectorMapVersion = useRestoreVectorMapVersion();

  const handleClick = useCallback(() => {
    restoreVectorMapVersion(version.version);
  }, [restoreVectorMapVersion, version]);

  return (
    <li
      className={clsx(
        "version-history-entry",
        isMostRecent ? "current-version" : "older-version",
        isSelected ? "selected" : ""
      )}
      key={version.version}
    >
      <div className="version-history-entry-content">
        <>
          <span className="time">
            {formatShortDateTime(new Date(version.submitted))}
          </span>
          <span className="author">{version.created_by}</span>
          {!isMostRecent || (isMostRecent && !isSelected) ? (
            <CustomButton
              className="version-history-reset-button"
              onClick={handleClick}
            >
              <VkfIcon name="clock" />
            </CustomButton>
          ) : null}
        </>
      </div>
    </li>
  );
};

VersionHistoryEntry.propTypes = {
  isSelected: PropTypes.bool,
  isMostRecent: PropTypes.bool,
  version: PropTypes.shape({
    version: PropTypes.number,
    submitted: PropTypes.string,
    created_by: PropTypes.string,
  }).isRequired,
};

export default VersionHistoryEntry;
