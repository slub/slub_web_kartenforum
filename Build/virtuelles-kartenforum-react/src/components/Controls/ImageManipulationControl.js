/**
 * Created by jacob.mendt@pikobytes.de on 07.12.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { useState } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import Slider from "rc-slider";
import clsx from "clsx";
import { Control } from "ol/control";
import { translate } from "../../util/util";
import "./ImageManipulationControl.scss";

export const variables = {
    brightness: 0,
    contrast: 0,
    saturation: 0,
};

// Slider Component
const FilterSlider = (props) => {
    const {
        max = 1,
        min = 0,
        onChange = () => console.warn("onChange is not implemented."),
        step = 0.01,
        type = "",
        value = 0.5,
        tooltip,
    } = props;

    // Handle change
    const handleChange = (newValue) => {
        onChange(type, newValue);
    };

    return (
        <div className="filter-slider" title={tooltip}>
            <span className={clsx("slider-icon", type)} title={tooltip}></span>
            <div>
                <Slider
                    title={tooltip}
                    ariaLabelForHandle={tooltip}
                    max={max}
                    min={min}
                    onChange={handleChange}
                    step={step}
                    value={value}
                />
            </div>
            <span className="slider-tooltip" title={tooltip}>
                {value}
            </span>
        </div>
    );
};

FilterSlider.propTypes = {
    max: PropTypes.number,
    min: PropTypes.number,
    onChange: PropTypes.number,
    step: PropTypes.number,
    tooltip: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.number,
};

// Inner content: component
const ImageManipulationTool = (props) => {
    const { layer } = props;
    const [values, setValues] = useState({ ...variables });

    const handleChange = (type, newValue) => {
        const newValues = Object.assign({}, values, { [type]: newValue });
        setValues(newValues);

        // Update the layer
        layer.updateStyleVariables(newValues);
    };

    const handleClickReset = () => {
        setValues({ ...variables });
        layer.updateStyleVariables({ ...variables });
    };

    return (
        <div>
            <FilterSlider
                max={1}
                min={-1}
                onChange={handleChange}
                step={0.01}
                type="contrast"
                value={values.contrast}
                tooltip={translate("control-imagemanipulation-contrast")}
            />
            <FilterSlider
                max={1}
                min={-1}
                onChange={handleChange}
                step={0.01}
                type="saturation"
                value={values.saturation}
                tooltip={translate("control-imagemanipulation-saturation")}
            />
            <FilterSlider
                max={1}
                min={-1}
                onChange={handleChange}
                step={0.01}
                type="brightness"
                value={values.brightness}
                tooltip={translate("control-imagemanipulation-brightness")}
            />
            <button
                className="btn-reset"
                title={translate("control-imagemanipulation-reset")}
                onClick={handleClickReset}
            >
                {translate("control-imagemanipulation-reset")}
            </button>
        </div>
    );
};
ImageManipulationTool.propTypes = {
    layer: PropTypes.object,
};

export class ImageManipulationControl extends Control {
    /**
     *
     * @param {{
     *    layer: ol.Layer
     * }} options
     */
    constructor(options) {
        const defaultClass = "ol-unselectable ol-control image-manipulation";

        // Load default html and behavior
        const element = document.createElement("div");
        element.className = defaultClass;

        // Control button
        const button = document.createElement("button");
        button.title = translate("control-imagemanipulation-open");
        button.innerHTML = "I";
        button.type = "button";
        element.appendChild(button);

        // Container for the elements if control is active
        const contentContainer = document.createElement("div");
        contentContainer.className = "content-container";
        contentContainer.style.display = "none";
        element.appendChild(contentContainer);

        // Define the handler
        const handleToggleControl = () => {
            const isActive = contentContainer.style.display === "block";
            element.className = isActive
                ? defaultClass
                : `${defaultClass} active`;
            contentContainer.style.display = isActive ? "none" : "block";
        };

        // Attach the image manipulation tool
        ReactDOM.render(
            <ImageManipulationTool layer={options.layer} />,
            contentContainer
        );

        // Add event listeners
        button.addEventListener("click", handleToggleControl, false);
        button.addEventListener("touchstart", handleToggleControl, false);

        super({ element, target: options.target });
    }
}

export default ImageManipulationControl;
