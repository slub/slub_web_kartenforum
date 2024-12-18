/*
 * Created by tom.schulze@pikobytes.de on 13.12.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { atom, selector, useRecoilCallback, useRecoilValue } from "recoil";
import { vectorMapDrawState } from "@map/atoms";
import { VECTOR_MAP_TYPES } from "../constants";
import { isDefined } from "@util/util";
import { getVectorMapRoles } from "../util/apiVectorMaps";
import { useEffect } from "react";
import { API_ROLES } from "./constants";

const vectorMapRolesQueryIdState = atom({
    key: "vectorMapRolesQueryIdState",
    default: 0,
});

const vectorMapRolesQuery = selector({
    key: "vectorMapRolesQuery",
    get: async ({ get }) => {
        get(vectorMapRolesQueryIdState);
        const { id, type } = get(vectorMapDrawState);
        const roles = {
            editors: [],
            owners: [],
        };

        if (type === VECTOR_MAP_TYPES.LOCAL) {
            return roles;
        }

        if (!isDefined(id)) {
            return roles;
        }

        const apiRoles = await getVectorMapRoles(id);

        for (const { user_id, role } of apiRoles) {
            if (role === API_ROLES.EDITOR) {
                roles.editors.push(user_id);
            } else if (role === API_ROLES.OWNER) {
                roles.owners.push(user_id);
            } else {
                console.warn(`Cannot map unknown role '${role}'`);
            }
        }

        return roles;
    },
});

export const useRefreshRolesQuery = () => {
    const refreshQuery = useRecoilCallback(
        ({ set }) =>
            () => {
                set(vectorMapRolesQueryIdState, (oldId) => oldId + 1);
            },
        []
    );

    return refreshQuery;
};

const useVectorMapRolesQuery = () => {
    const refreshQuery = useRefreshRolesQuery();

    const roles = useRecoilValue(vectorMapRolesQuery);

    useEffect(() => {
        return () => {
            refreshQuery();
        };
    }, []);

    return roles;
};

export default useVectorMapRolesQuery;
