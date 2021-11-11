/**
 * Created by jacob.mendt@pikobytes.de on 11.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { atom } from "recoil";

export const transformationState = atom({
    key: "transformationState",
    default: null,
});
