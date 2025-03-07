/**
 * Created by nicolas.looschen@pikobytes.de on 21.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Glyphicon, Overlay, Tooltip } from "react-bootstrap";

import { translate } from "@util/util.js";

export const CopyToClipboardButton = ({ title, onClick, value }) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const refButton = useRef();
  const refTimeout = useRef();

  const handleCopyToClipboard = useCallback(() => {
    const promise =
      onClick !== undefined && value === ""
        ? onClick()
        : new Promise((resolve) => resolve());

    promise.then((newUrl) => {
      clearTimeout(refTimeout.current);
      navigator.clipboard.writeText(newUrl !== undefined ? newUrl : value);
      setIsTooltipOpen(true);
    });
  }, [onClick, value]);

  // close tooltip after 1 second
  useEffect(() => {
    if (isTooltipOpen) {
      refTimeout.current = setTimeout(() => {
        setIsTooltipOpen(false);
      }, 1000);
    }

    return () => {
      clearTimeout(refTimeout.current);
    };
  }, [isTooltipOpen]);

  return (
    <>
      <button
        className="copy-button"
        onClick={handleCopyToClipboard}
        ref={refButton}
        title={title ?? translate("control-permalink-exporter-copy-title")}
      >
        <Glyphicon glyph="copy" />
      </button>
      <Overlay
        placement="right"
        target={refButton.current}
        show={isTooltipOpen}
      >
        <Tooltip id="copy-state-indicator">
          {translate("control-permalink-exporter-copy")}
        </Tooltip>
      </Overlay>
    </>
  );
};

CopyToClipboardButton.propTypes = {
  title: PropTypes.string,
  onClick: PropTypes.func,
  value: PropTypes.string,
};

export default CopyToClipboardButton;
