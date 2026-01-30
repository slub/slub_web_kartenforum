/*
 * Created by tom.schulze@pikobytes.de on 21.01.26.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { activeDialogState } from "@map/atoms";
import { useRecoilCallback, atom } from "recoil";
import { ActiveDialog } from "../VkfMap/constants";

export const isCustomWmsDialogOpenState = atom({
    key: "isCustomWmsDialogOpenState",
    default: false,
});

export const useShouldBasemapSelectorDialogStayOpen = () =>
    useRecoilCallback(
        ({ snapshot }) =>
            async () => {
                const isBasemapControlActive =
                    (await snapshot.getPromise(activeDialogState)) ===
                    ActiveDialog.BasemapSelector;
                const isDialogOpen = await snapshot.getPromise(
                    isCustomWmsDialogOpenState
                );

                return isDialogOpen && isBasemapControlActive;
            },
        []
    );
