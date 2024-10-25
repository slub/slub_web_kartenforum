/**
 * Created by nicolas.looschen@pikobytes.de on 16.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import { RecoilRoot } from "recoil";
import { useWindowWidth } from "@react-hook/window-size";
import PropTypes from "prop-types";

import Notifications from "@components/Notifications";

import { PersistenceController } from "./persistence/PersistenceController";
import { getLayoutForWidth } from "./layouts/util";
import LayoutSwitcher from "./layouts/LayoutSwitcher";
import "./App.scss";

export const App = () => {
  const width = useWindowWidth();
  const layoutType = getLayoutForWidth(width);
  return (
    <RecoilRoot>
      <div className="vkf-plugin-map">
        <Notifications />
        <LayoutSwitcher layout={layoutType} />
        <PersistenceController />
      </div>
    </RecoilRoot>
  );
};

App.propTypes = {
  id: PropTypes.string.isRequired,
};

export default App;
