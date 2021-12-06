/**
 * Created by nicolas.looschen@pikobytes.de on 16.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import { RecoilRoot } from "recoil";
import { DndProvider } from "react-dnd-multi-backend";
import { HTML5toTouch } from "rdndmb-html5-to-touch";
import { useWindowWidth } from "@react-hook/window-size";

import StyleAppender from "./components/StyleAppender/StyleAppender";
import { PersistenceController } from "./persistence/PersistenceController";
import SettingsProvider from "../../SettingsProvider";
import MapWrapper from "./components/MapWrapper/MapWrapper";
import { getLayoutForWidth } from "./layouts/util";
import { LayoutSwitcher } from "./layouts/LayoutSwitcher";

const customBackends = HTML5toTouch.backends.map((backend) => {
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
    const settings = SettingsProvider.getSettings();
    const width = useWindowWidth();
    const layoutType = getLayoutForWidth(width);

    return (
        <DndProvider
            options={Object.assign({}, HTML5toTouch, {
                backends: customBackends,
            })}
        >
            <RecoilRoot>
                <LayoutSwitcher layout={layoutType} />
                <MapWrapper
                    baseMapUrl={settings["OSM_URLS"]}
                    enable3d
                    enableTerrain
                    layout={layoutType}
                    mapViewSettings={settings["MAPVIEW_PARAMS"]}
                    terrainTilesUrl={settings["TERRAIN_TILES_URL"]}
                />
                <StyleAppender />
                <PersistenceController />
            </RecoilRoot>
        </DndProvider>
    );
};

export default App;
