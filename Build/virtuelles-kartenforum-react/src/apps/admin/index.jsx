/**
 * Created by jacob.mendt@pikobytes.de on 24.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React from "react";
import ReactDOM from "react-dom";
import settingsProvider from "../../SettingsProvider";
import Evaluation from "./Evaluation";

export const SettingsProvider = settingsProvider;

export function renderAdminApp(element) {
  ReactDOM.render(<Evaluation />, element);
}
