/**
 * Created by nicolas.looschen@pikobytes.de on 03.01.22.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { useDrop } from "react-dnd";
import { HTML5toTouch } from "rdndmb-html5-to-touch";
import { DndProvider } from "react-dnd-multi-backend";
import { NativeTypes } from "react-dnd-html5-backend";

import SvgIcons from "@components/SvgIcons/SvgIcons.jsx";
import { translate } from "@util/util";
import { parseGeoJsonFile } from "./util.js";
import "./Dropzone.scss";

const { FILE } = NativeTypes;

const ERROR_TYPES = {
  WRONG_FILETYPE: "wrong-filetype",
};

export const customBackends = HTML5toTouch.backends.map((backend) => {
  if (backend.id === "touch") {
    return {
      ...backend,
      options: {
        ...backend.options,
        scrollAngleRanges: [
          { start: 30, end: 150 },
          { start: 210, end: 330 },
        ],
      },
    };
  }
  return backend;
});

export const Dropzone = ({ children, onDrop, onError }) => {
  const [error, setError] = useState(undefined);

  ///
  // Handler section
  ///

  const publishGeoJson = (files) => {
    const file = files[0];
    parseGeoJsonFile(file, onDrop, onError);
  };

  // setup drag and drop behaviour
  const [{ isOver }, drop] = useDrop({
    accept: FILE,
    collect(monitor) {
      return {
        canDrop: monitor.canDrop(),
        isOver: monitor.isOver(),
      };
    },
    drop: (item) => {
      publishGeoJson(item.files);
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
  });

  ///
  // Effect section
  ///

  // reset error on item leave
  useEffect(() => {
    if (!isOver) {
      setError(undefined);
    }
  }, [isOver]);

  return (
    <div
      className={clsx("vkf-dropzone", isOver && "animation-show")}
      ref={drop}
    >
      {isOver && (
        <div className="dropzone-content">
          <p className={clsx("dropzone-info", error !== undefined && "error")}>
            {error === undefined
              ? translate("dropzone-drop")
              : translate(`dropzone-${error}`)}
          </p>
          <SvgIcons name="dropzone-upload" />
        </div>
      )}
      {children}
    </div>
  );
};

Dropzone.propTypes = {
  children: PropTypes.node,
  onDrop: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

const WrappedDropzone = (props) => {
  return (
    <DndProvider
      options={Object.assign({}, HTML5toTouch, {
        backends: customBackends,
      })}
    >
      <Dropzone {...props}>{props.children}</Dropzone>
    </DndProvider>
  );
};

WrappedDropzone.propTypes = Dropzone.propTypes;

export default WrappedDropzone;
