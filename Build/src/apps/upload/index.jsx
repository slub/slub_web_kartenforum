/**
 * Created by pouria.rezaei@pikobytes.de on 13.06.23.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import ReactDOM from "react-dom";
import "core-js";

import App from "./App";
import settingsProvider from "../../SettingsProvider";
export const SettingsProvider = settingsProvider;
export function renderApp(element) {
  ReactDOM.render(<App id={element.id} />, element);
}
