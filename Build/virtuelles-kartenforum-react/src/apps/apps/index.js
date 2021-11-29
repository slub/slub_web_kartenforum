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
import GeoreferenceRanking from "./GeoreferenceRanking";
import ProgressBarApp from "./ProgressBarApp";
import UnreferencedMaps from "./UnreferencedMaps";
import UserHistory from "./UserHistory";

export const SettingsProvider = settingsProvider;

export function renderEvaluation(element) {
    ReactDOM.render(<Evaluation />, element);
}

export function renderGeoreferenceRanking(element) {
    ReactDOM.render(<GeoreferenceRanking />, element);
}

export function renderProgressBar(element) {
    ReactDOM.render(<ProgressBarApp />, element);
}

export function renderUnreferencedMaps(element) {
    ReactDOM.render(<UnreferencedMaps />, element);
}

export function renderUserHistory(element) {
    ReactDOM.render(<UserHistory />, element);
}
