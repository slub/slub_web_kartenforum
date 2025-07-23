/*
 * Created by tom.schulze@pikobytes.de on 13.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { notificationState } from "@atoms";
import { translate } from "@util/util";
import { useRecoilCallback } from "recoil";

const createSuccessNotification = ({ id, translationKey }) => ({
    id,
    type: "success",
    text: translate(translationKey),
});

const createErrorNotificatiion = ({ id, translationKey }) => ({
    id,
    type: "danger",
    text: translate(translationKey),
});

const useNotification = (id = "mapWrapper") => {
    const notifySuccess = useRecoilCallback(
        ({ set }) =>
            (key) => {
                const msg = createSuccessNotification({
                    id,
                    translationKey: key,
                });
                set(notificationState, msg);
            },
        [id]
    );

    const notifyError = useRecoilCallback(
        ({ set }) =>
            (key) => {
                const msg = createErrorNotificatiion({
                    id,
                    translationKey: key,
                });
                set(notificationState, msg);
            },
        [id]
    );

    return { notifySuccess, notifyError };
};

export default useNotification;
