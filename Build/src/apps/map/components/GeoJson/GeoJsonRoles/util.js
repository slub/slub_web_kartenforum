/*
 * Created by tom.schulze@pikobytes.de on 13.12.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { isDefined } from "@util/util";
import { API_ROLES, FORM_FIELDS } from "./constants";

const FIELD_ROLES_MAP = { owners: API_ROLES.OWNER, editors: API_ROLES.EDITOR };

export const assembleDataForApi = (submittedData, initialData) => {
    const roles = { removed: [], added: [] };

    for (const fieldName of Object.values(FORM_FIELDS)) {
        const role = FIELD_ROLES_MAP[fieldName];

        if (!isDefined(role)) {
            continue;
        }

        if (!isDefined(submittedData[fieldName])) {
            continue;
        }

        let addedUsers = submittedData[fieldName].filter(
            (userId) => !initialData[fieldName].includes(userId)
        );
        let removedUsers = initialData[fieldName].filter(
            (userId) => !submittedData[fieldName].includes(userId)
        );

        addedUsers = addedUsers.map((userId) => ({ user_id: userId, role }));
        removedUsers = removedUsers.map((userId) => ({
            user_id: userId,
            role,
        }));

        roles.added.push(...addedUsers);
        roles.removed.push(...removedUsers);
    }

    return roles;
};
