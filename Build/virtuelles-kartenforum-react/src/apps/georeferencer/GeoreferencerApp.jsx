/**
 * Created by jacob.mendt@pikobytes.de on 10.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import { RecoilRoot } from "recoil";
import ControllerGeoreferencer from "./components/ControllerGeoreferencer/ControllerGeoreferencer";
import Header from "./components/Header/Header";
import SelectTransform from "./components/SelectTransform/SelectTransform";
import "./GeoreferencerApp.scss";

export const GeoreferencerApp = () => {
  return (
    <RecoilRoot>
      <ControllerGeoreferencer />
      <div className="vk-app-georeferencer">
        <Header>
          <SelectTransform />
        </Header>
      </div>
    </RecoilRoot>
  );
};

export default GeoreferencerApp;
