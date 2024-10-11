/**
 * Created by nicolas.looschen@pikobytes.de on 16.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import ReactDOM from "react-dom";
import "core-js";

import App from "./App";
import settingsProvider from "@settings-provider";

export const SettingsProvider = settingsProvider;
export function renderApp(element) {
  ReactDOM.render(<App id={element.id} />, element);
}
