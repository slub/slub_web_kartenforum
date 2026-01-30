/*
 * Created by tom.schulze@pikobytes.de on 27.01.26.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { notificationState } from "@atoms";
import { useCallback } from "react";
import { atom, selector, useSetRecoilState } from "recoil";

// layers

export const selectableWmsLayersAtom = atom({
    key: "selectableWmsLayersAtom",
    default: [],
});

export const hasWmsSelectableLayersAtom = selector({
    key: "hasWmsSelectableLayersAtom",
    get: ({ get }) => {
        const layers = get(selectableWmsLayersAtom);

        return layers.length > 0;
    },
});

export const isParsingWmsCapabilitiesAtom = atom({
    key: "isParsingWmsCapabilitiesAtom",
    default: false,
});

// hook-based state API

export const useResetSelectableLayers = () => {
    const setSelectableLayers = useSetRecoilState(selectableWmsLayersAtom);

    const resetSelectableLayers = useCallback(() => {
        setSelectableLayers([]);
    }, []);

    return resetSelectableLayers;
};

export const useNotifyError = () => {
    const setNotification = useSetRecoilState(notificationState);

    const notifyError = useCallback((msg) => {
        setNotification({
            id: "add-custom-wms",
            type: "danger",
            text: msg,
        });
    }, []);

    return notifyError;
};
