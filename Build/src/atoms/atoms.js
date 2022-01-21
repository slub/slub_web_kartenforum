/**
 * Created by nicolas.looschen@pikobytes.de on 03.12.2021.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import { atom } from "recoil";

export const notificationState = atom({
    key: "notificationState",
    default: null,
});
