/**
 * Created by jacob.mendt@pikobytes.de on 16.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import PropTypes from "prop-types";
import { Dropdown, MenuItem } from "react-bootstrap";
import clsx from "clsx";
import { translate } from "@util/util";
import SvgIcons from "@components/SvgIcons";

import "./ControlDropDown.scss";

export const ControlGcpsIds = {
  NONE: "control-none-gcp",
  ADD: "control-add-gcp",
  MOVE: "control-move-gcp",
  DEL: "control-del-gcp",
};
export const ControlDropDown = (props) => {
  const {
    id,
    activeControl,
    className = "",
    parentIconClassName,
    defaultTitle = "unknown",
    disableActiveBehavior = false,
    IconComponent,
    options = [
      {
        id: ControlGcpsIds.ADD,
        title: translate("georef-setgcp"),
        iconClassName: "icon-point-add",
      },
      {
        id: ControlGcpsIds.MOVE,
        title: translate("georef-movegcp"),
        iconClassName: "icon-point-move",
      },
      {
        id: ControlGcpsIds.DEL,
        title: translate("georef-delgcp"),
        iconClassName: "icon-point-remove",
      },
    ],
    onClick,
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
        id={id}
        className="btn-dropdown-vkf-control"
        bsStyle="default"
        key={activeOption ? activeOption.id : null}
      >
        <Dropdown.Toggle>
          {IconComponent === undefined ? (
            <SvgIcons name={parentIconClassName} size={24} />
          ) : (
            <IconComponent glyph={parentIconClassName} />
          )}
          {activeOption ? activeOption.title : defaultTitle}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {options.map((o) => (
            <MenuItem
              key={o.id}
              eventKey={o.id}
              onClick={() => handleClick(o.id)}
              className={clsx("control-option", o.id)}
            >
              {IconComponent === undefined ? (
                <SvgIcons name={`${o.iconClassName}`} size={24} />
              ) : (
                <IconComponent glyph={o.iconClassName} />
              )}
              <span className="text">{o.title}</span>
            </MenuItem>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

ControlDropDown.propTypes = {
  activeControl: PropTypes.string,
  className: PropTypes.string,
  defaultTitle: PropTypes.string,
  disableActiveBehavior: PropTypes.bool,
  IconComponent: PropTypes.elementType,
  id: PropTypes.string,
  parentIconClassName: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      iconClassName: PropTypes.string.isRequired,
    })
  ),
  onClick: PropTypes.func.isRequired,
};

export default ControlDropDown;
