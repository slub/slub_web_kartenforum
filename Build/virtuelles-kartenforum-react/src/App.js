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

import { MainLayout } from "./layouts/MainLayout/MainLayout";
import StyleAppender from "./components/StyleAppender/StyleAppender";

export const App = (props) => {
    return (
        <DndProvider options={HTML5toTouch}>
            <RecoilRoot>
                <MainLayout test={"test"} />
                <StyleAppender />
            </RecoilRoot>
        </DndProvider>
    );
};

export default App;
