/**
 * Created by nicolas.looschen@pikobytes.de on 16.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import React from "react";
import { MainLayout } from "./layouts/MainLayout/MainLayout";
import { RecoilRoot } from "recoil";
import { SettingsProvider } from "./index";

export const App = (props) => {
    return (
        <RecoilRoot>
            <MainLayout test={"test"} />
        </RecoilRoot>
    );
};

export default App;
