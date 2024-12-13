/*
 * Created by tom.schulze@pikobytes.de on 13.12.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { useRecoilCallback } from "recoil";
import { addVectorMapRoles, removeVectorMapRoles } from "../util/apiVectorMaps";
import { vectorMapDrawState } from "@map/atoms";
import { VECTOR_MAP_TYPES } from "../constants";
import { isDefined } from "@util/util";

const useSaveVectorMapRoles = () => {
  const saveRoles = useRecoilCallback(
    ({ snapshot }) =>
      async ({ added, removed }) => {
        const { id, type } = await snapshot.getPromise(vectorMapDrawState);
        if (type === VECTOR_MAP_TYPES.LOCAL) {
          return Promise.resolve();
        }

        if (!isDefined(id)) {
          return Promise.resolve();
        }

        const promises = [];
        if (added.length > 0) {
          promises.push(addVectorMapRoles(id, added));
        }

        if (removed.length > 0) {
          promises.push(removeVectorMapRoles(id, removed));
        }

        if (promises.length > 0) {
          return Promise.all(promises);
        }

        return Promise.resolve();
      }
  );

  return saveRoles;
};

export default useSaveVectorMapRoles;
