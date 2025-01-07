/*
 * Created by tom.schulze@pikobytes.de on 13.12.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { useRecoilCallback } from "recoil";
import { updateVectorMapRoles } from "../util/apiVectorMaps";
import { vectorMapDrawState } from "@map/atoms";
import { VECTOR_MAP_TYPES } from "../constants";
import { isDefined } from "@util/util";

const useSaveVectorMapRoles = () => {
    const saveRoles = useRecoilCallback(
        ({ snapshot }) =>
            async (roles) => {
                const { id, type } = await snapshot.getPromise(
                    vectorMapDrawState
                );
                if (type === VECTOR_MAP_TYPES.LOCAL) {
                    return Promise.resolve();
                }

                if (!isDefined(id)) {
                    return Promise.resolve();
                }

                return updateVectorMapRoles(id, roles);
            },
        []
    );

    return saveRoles;
};

export default useSaveVectorMapRoles;
