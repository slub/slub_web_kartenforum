/**
 * Created by nicolas.looschen@pikobytes.de on 16.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import AppGeoreferencer from "./apps/georeferencer/GeoreferencerApp";
import settingsProvider from "./SettingsProvider";

export const SettingsProvider = settingsProvider;

export function renderApp(element) {
    ReactDOM.render(<App />, element);
}

export function renderGeoreferenceApp(element) {
    ReactDOM.render(<AppGeoreferencer />, element);
}
