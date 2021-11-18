/**
 * Created by jacob.mendt@pikobytes.de on 16.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import PropTypes from "prop-types";
import { Dropdown, DropdownButton, MenuItem } from "react-bootstrap";
import clsx from "clsx";
import { translate } from "../../../../util/util";
import "./ControlDropDown.scss";

export const ControlGcpsIds = {
    NONE: "control-none-gcp",
    ADD: "control-add-gcp",
    MOVE: "control-move-gcp",
    DEL: "control-del-gcp",
};
export const ControlDropDown = (props) => {
    const {
        activeControl,
        className = "",
        defaultTitle = "unknown",
        disableActiveBehavior = false,
        options = [
            {
                id: ControlGcpsIds.ADD,
                title: translate("georef-setgcp"),
                iconClassName: "icon-add-gcp",
            },
            {
                id: ControlGcpsIds.MOVE,
                title: translate("georef-movegcp"),
                iconClassName: "icon-move-gcp",
            },
            {
                id: ControlGcpsIds.DEL,
                title: translate("georef-delgcp"),
                iconClassName: "icon-del-gcp",
            },
        ],
        onClick,
        toggleIcon,
    } = props;
    const activeOption = options.find((o) => o.id === activeControl);

    // Handle click event
    const handleClick = (newId) => {
        onClick(newId);
    };

    return (
        <div
            className={clsx(
                "vkf-control-dropdown",
                activeOption && !disableActiveBehavior ? "active" : "",
                className
            )}
        >
            <Dropdown
                className="btn-dropdown-vkf-control"
                bsStyle="default"
                key={activeOption ? activeOption.id : null}
            >
                <Dropdown.Toggle>
                    {toggleIcon !== undefined && toggleIcon}
                    {activeOption ? activeOption.title : defaultTitle}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {options.map((o) => (
                        <MenuItem
                            eventKey={o.id}
                            onClick={() => handleClick(o.id)}
                            className={clsx("control-option", o.id)}
                        >
                            <div>
                                <span className="text">{o.title}</span>
                                <span
                                    className={clsx("icon", o.iconClassName)}
                                />
                            </div>
                        </MenuItem>
                    ))}
                </Dropdown.Menu>
            </Dropdown>

            {/*<DropdownButton*/}
            {/*    className="btn-dropdown-vkf-control"*/}
            {/*    bsStyle="default"*/}
            {/*    title={activeOption ? activeOption.title : defaultTitle}*/}
            {/*    key={activeOption ? activeOption.id : null}*/}
            {/*>*/}
            {/*    {*/}
            {/*        options.map(*/}
            {/*            (o) => (*/}
            {/*                <MenuItem eventKey={o.id} onClick={() => handleClick(o.id)} className={clsx("control-option", o.id)}>*/}
            {/*                    <div>*/}
            {/*                        <span className="text">{o.title}</span>*/}
            {/*                        <span className={clsx("icon", o.iconClassName)}  />*/}
            {/*                    </div>*/}
            {/*                </MenuItem>*/}

            {/*            )*/}
            {/*        )*/}
            {/*    }*/}
            {/*</DropdownButton>*/}
        </div>
    );
};

ControlDropDown.propTypes = {
    activeControl: PropTypes.string,
    className: PropTypes.string,
    defaultTitle: PropTypes.string,
    disableActiveBehavior: PropTypes.bool,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            iconClassName: PropTypes.string.isRequired,
        })
    ),
    onClick: PropTypes.func.isRequired,
    toggleIcon: PropTypes.node,
};

export default ControlDropDown;
