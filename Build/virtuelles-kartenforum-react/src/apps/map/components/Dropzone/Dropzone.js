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

import { translate } from "../../../../util/util";
import "./Dropzone.scss";

const { FILE } = NativeTypes;

const ERROR_TYPES = {
    WRONG_FILETYPE: "wrong-filetype",
};

export const Dropzone = ({ children, onDrop, onError }) => {
    const [error, setError] = useState(undefined);

    ///
    // Handler section
    ///

    const publishGeoJson = (files) => {
        const file = files[0];

        const reader = new FileReader();
        reader.onloadend = function () {
            try {
                onDrop({
                    content: JSON.parse(this.result),
                    modified: file.lastModifiedDate,
                    name: file.name.split(".")[0],
                });
            } catch (e) {
                console.log(e);
                onError();
            }
        };

        reader.readAsText(file);
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
                if (item.items[0].type !== "application/json") {
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
        <DndProvider options={HTML5toTouch}>
            <Dropzone {...props}>{props.children}</Dropzone>
        </DndProvider>
    );
};

WrappedDropzone.propTypes = Dropzone.propTypes;

export default WrappedDropzone;
