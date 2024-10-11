/**
 * Created by pouria.rezaei@pikobytes.de on 9/23/24.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { activeDialogState, mapState } from "@map/atoms";
import { isDefined } from "@util/util.js";
import {
    ActiveDialog,
    CustomEvents,
} from "@map/components/VkfMap/constants.js";

const useControlContainer = (controlId, dialogType) => {
    const map = useRecoilValue(mapState);
    const [baseMapControlEl, setBaseMapControlEl] = useState(null);
    const [activeDialog, setActiveDialog] = useRecoilState(activeDialogState);
    const dialogRef = useRef(null);

    const handleClickAway = useCallback((event) => {
        if (dialogRef.current && !dialogRef.current.contains(event.target)) {
            setActiveDialog(ActiveDialog.None);
        }
    }, []);

    const toggleDialog = useCallback(() => {
        setActiveDialog((prev) =>
            prev === dialogType ? ActiveDialog.None : dialogType
        );
    }, [dialogType]);

    useEffect(() => {
        if (isDefined(map)) {
            const handleAddControl = (e) => {
                if (e.control?.id === controlId) {
                    setBaseMapControlEl(e.control._container);
                }
            };

            const handleRemoveControl = (e) => {
                if (e.control?.id === controlId) {
                    setBaseMapControlEl(null);
                }
            };

            map.on(CustomEvents.controlAdded, handleAddControl);
            map.on(CustomEvents.controlRemoved, handleRemoveControl);

            return () => {
                map.off(CustomEvents.controlAdded, handleAddControl);
                map.off(CustomEvents.controlRemoved, handleRemoveControl);
            };
        }
    }, [map]);

    useEffect(() => {
        if (activeDialog === dialogType) {
            document.addEventListener("mousedown", handleClickAway);
        } else {
            document.removeEventListener("mousedown", handleClickAway);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickAway);
        };
    }, [activeDialog, dialogType, handleClickAway]);

    return { baseMapControlEl, activeDialog, toggleDialog, dialogRef };
};

export default useControlContainer;
