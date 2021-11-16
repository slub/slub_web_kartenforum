/**
 * Created by jacob.mendt@pikobytes.de on 10.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import PropTypes from "prop-types";
import "./Header.scss";

export const Header = (props) => {
  const { children } = props;
  return (
    <div className="vk-header-app-georeference">
      <h1>
        <span className="logo">VK20 Georeferenzierung</span> Neue
        Georeferenzierung
      </h1>

      <div className="menu-controls">{children}</div>
    </div>
  );
};

Header.propTypes = {
  children: PropTypes.node,
};

export default Header;
