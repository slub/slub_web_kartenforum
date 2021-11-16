/**
 * Created by jacob.mendt@pikobytes.de on 16.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import ReactDOM from "react-dom";
import App from "./apps/map/App";
import settingsProvider from "./SettingsProvider";
export const SettingsProvider = settingsProvider;

export function renderApp(element) {
    ReactDOM.render(<App />, element);
}
