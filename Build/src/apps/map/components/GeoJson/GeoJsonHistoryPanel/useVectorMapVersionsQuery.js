/*
 * Created by tom.schulze@pikobytes.de on 18.12.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { getVectorMapVersions } from "../util/apiVectorMaps";
import { atom, selector, useRecoilCallback, useRecoilValue } from "recoil";
import { vectorMapDrawState } from "@map/atoms";
import { isDefined } from "@util/util";

const vectorMapVersionsQueryIdState = atom({
    key: "vectorMapVersionsQueryIdState",
    default: 0,
});

const vectorMapVersionsQuery = selector({
    key: "vectorMapVersionsQuery",
    get: async ({ get }) => {
        get(vectorMapVersionsQueryIdState);
        const vectorMap = get(vectorMapDrawState);

        if (
            !isDefined(vectorMap) ||
            vectorMap.type === "local" ||
            vectorMap.id === null
        ) {
            return null;
        }

        return await getVectorMapVersions(vectorMap.id);
    },
});

export const useRefreshVersionsQuery = () => {
    const refreshQuery = useRecoilCallback(
        ({ set }) =>
            () => {
                set(vectorMapVersionsQueryIdState, (oldVal) => oldVal + 1);
            },
        []
    );

    return refreshQuery;
};

const useVectorMapVersionsQuery = () => {
    const vectorMapVersions = useRecoilValue(vectorMapVersionsQuery);

    return vectorMapVersions;
};

export default useVectorMapVersionsQuery;
