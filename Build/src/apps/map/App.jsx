/**
 * Created by nicolas.looschen@pikobytes.de on 16.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React, { useMemo } from "react";
import { RecoilRoot } from "recoil";
import { useWindowWidth } from "@react-hook/window-size";
import PropTypes from "prop-types";
import { HTML5toTouch } from "rdndmb-html5-to-touch";
import { DndProvider } from "react-dnd-multi-backend";

import Notifications from "@components/Notifications";
import RecoilExternal from "@components/RecoilExternal";

import { PersistenceController } from "./persistence/PersistenceController";
import { getLayoutForWidth } from "./layouts/util";
import LayoutSwitcher from "./layouts/LayoutSwitcher";
import "./App.scss";

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

export const App = () => {
  const width = useWindowWidth();
  const layoutType = getLayoutForWidth(width);

  const dndOptions = useMemo(
    () =>
      Object.assign({}, HTML5toTouch, {
        backends: customBackends,
      }),
    []
  );

  return (
    <DndProvider options={dndOptions}>
      <RecoilRoot>
        <RecoilExternal />
        <div className="vkf-plugin-map">
          <Notifications />
          <LayoutSwitcher layout={layoutType} />
          <PersistenceController />
        </div>
      </RecoilRoot>
    </DndProvider>
  );
};

App.propTypes = {
  id: PropTypes.string.isRequired,
};

export default App;
