/**
 * Created by thomas@jung.digital on 21.01.22.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, {useState, useEffect, useRef} from "react";
import clsx from "clsx";
import "./GeoJsonUploadHint.scss";
import {translate} from "../../../../../util/util.js";
import SvgIcons from "../../../../../components/SvgIcons/SvgIcons.jsx";

export const GeoJsonUploadHint = () => {

    const [open, setOpen] = useState(false);

    // Toggle open state of the menu
    const handleToggleMenu = (e) => {
        e.preventDefault();
        if (open) {
            setOpen(false);
        } else {
            setOpen(true);
        }
    };

    return (
        <div className={clsx("geojson-upload-hint", open && "show")}>
            <button className="geojson-upload" onClick={handleToggleMenu}>
                <SvgIcons name="layermanagement-upload"/>
                <span className="label">{translate("geojson-adddialog-title")}</span>
            </button>
            <div className="upload-info">
                {translate("geojson-adddialog-body")}
            </div>
        </div>
    );
};

export default GeoJsonUploadHint;
