/**
 * Created by nicolas.looschen@pikobytes.de on 28.06.22.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import ReactDOM from "react-dom";
import "core-js";

import AppMosaicMap from "./AppMosaicMap.jsx";
import settingsProvider from "@settings-provider";

export const SettingsProvider = settingsProvider;

export function renderMosaicMapApp(element) {
  ReactDOM.render(<AppMosaicMap />, element);
}
