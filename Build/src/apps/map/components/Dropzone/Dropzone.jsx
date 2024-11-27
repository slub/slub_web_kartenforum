/**
 * Created by nicolas.looschen@pikobytes.de on 03.01.22.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import { useRecoilState, useSetRecoilState } from "recoil";

import { addedFileState, showDropZoneState } from "@map/atoms";
import SvgIcons from "@components/SvgIcons/SvgIcons.jsx";
import { translate } from "@util/util";
import { parseGeoJsonFile } from "./util.js";
import GeoJsonFileInput from "@map/components/Dropzone/components/GeoJsonFileInput";
import { notificationState } from "@atoms";

import "./Dropzone.scss";
import { createPortal } from "react-dom";

const { FILE } = NativeTypes;

const ERROR_TYPES = {
  WRONG_FILETYPE: "wrong-filetype",
};

export const Dropzone = () => {
  const [error, setError] = useState(undefined);
  const [showDropzone, setShowDropZone] = useRecoilState(showDropZoneState);
  const setSelectedFileState = useSetRecoilState(addedFileState);
  const setNotification = useSetRecoilState(notificationState);

  const refFileInput = useRef();

  const handleParseError = useCallback((e) => {
    console.error(e);

    setNotification({
      id: "mapWrapper",
      type: "danger",
      text: translate("mapwrapper-geojson-parse-error"),
    });
  }, []);

  ///
  // Handler section
  ///

  const handleClickAway = useCallback(() => {
    setShowDropZone(false);
  }, []);

  // open file upload dialog
  const handleOpenFileDialog = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (refFileInput.current !== undefined && refFileInput.current !== null) {
      refFileInput.current.click();
      // Prevents the dialog from reopening when Enter is pressed by removing focus from the "Add GeoJSON" button.
      document.activeElement.blur();
    }
  }, []);

  // publish geojson file
  const handleSelectGeoJsonFile = useCallback(
    (file) => {
      parseGeoJsonFile(file)
        .then((fileState) => {
          setSelectedFileState(fileState);
          setShowDropZone(false);
        })
        .catch((error) => handleParseError(error));
    },
    [handleParseError]
  );

  const dropOptions = useMemo(
    () => ({
      accept: FILE,
      // disable while dropzone is not shown
      canDrop: () => showDropzone,
      collect(monitor) {
        return {
          canDrop: monitor.canDrop(),
          isOver: monitor.isOver(),
        };
      },
      drop: (item) => {
        handleSelectGeoJsonFile(item.files[0]);
      },
      hover: (_, monitor) => {
        const item = monitor.getItem();

        if (item.items.length > 0) {
          if (
            item.items[0].type !== "application/json" &&
            item.items[0].type !== "application/geo+json"
          ) {
            setError(ERROR_TYPES.WRONG_FILETYPE);
          }
        }
      },
    }),
    [handleSelectGeoJsonFile, showDropzone]
  );

  // setup drag and drop behaviour
  const [{ isOver }, drop] = useDrop(dropOptions);

  ///
  // Effect section
  ///

  // reset error on item leave
  useEffect(() => {
    if (!isOver) {
      setError(undefined);
    }
  }, [isOver]);

  return showDropzone
    ? createPortal(
        <div
          className={clsx("vkf-dropzone", showDropzone && "animation-show")}
          ref={drop}
        >
          <div className="dropzone-content-container" onClick={handleClickAway}>
            <button onClick={handleOpenFileDialog} className="dropzone-content">
              <SvgIcons name="dropzone-upload" />
              <p
                className={clsx(
                  "dropzone-info",
                  error !== undefined && "error"
                )}
              >
                {error === undefined
                  ? translate("dropzone-drop")
                  : translate(`dropzone-${error}`)}
              </p>
            </button>
            <GeoJsonFileInput
              refFileInput={refFileInput}
              onSelectFile={handleSelectGeoJsonFile}
            />
          </div>
        </div>,
        document.body
      )
    : null;
};

Dropzone.propTypes = {
  children: PropTypes.node,
};

export default Dropzone;
