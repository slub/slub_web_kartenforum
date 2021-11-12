/**
 * Created by jacob.mendt@pikobytes.de on 12.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { translate } from "../../../../util/util";

import "./ToolboxTargetMap.scss";
export const ToolboxTargetMap = () => {
    const [toolboxOpen, setToolboxOpen] = useState(true);
    const [activeId, setActiveId] = useState(null);
    const controls = [
        {
            id: "move-map",
            class: "move-map",
            title: translate("georef-movemap"),
        },
        {
            id: "draw-clip",
            class: "draw-clip",
            title: translate("georef-drawclip"),
        },
    ];

    // Handle open / close
    const handleClickToggleControl = () => {
        setToolboxOpen(!toolboxOpen);
        setActiveId(null);
    };

    // Handle active control
    const handleClickControl = (e) => {
        setActiveId(e.target.id);
    };

    return (
        <div className="vk-toolbox-target-map">
            <div
                className={clsx("toggle-control", toolboxOpen ? "open" : "")}
                onClick={handleClickToggleControl}
            >
                <span className="icon" />
            </div>
            <div className={clsx("inner-container", toolboxOpen ? "open" : "")}>
                {controls.map((c) => (
                    <button
                        key={c.id}
                        className={clsx(
                            "tool-item",
                            c.class,
                            activeId === c.id ? "active" : ""
                        )}
                        title={c.title}
                        id={c.id}
                        onClick={handleClickControl}
                    />
                ))}
            </div>
        </div>
    );
};

export default ToolboxTargetMap;
