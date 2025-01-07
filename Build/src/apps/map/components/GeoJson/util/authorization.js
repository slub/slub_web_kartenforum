/**
 * Created by nicolas.looschen@pikobytes.de on 01.12.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { METADATA } from "@map/components/CustomLayers";
import { SettingsProvider } from "../../../../apps";
import { isDefined } from "@util/util";
import { VECTOR_MAP_TYPES } from "../constants";

const ADMIN_ROLE = "vk2-admin";
const EDITOR_ROLE = "vk2-editor";
const OWNER_ROLE = "owner";
const EDITOR_ROLE_MAP = "editor";

// Called before anything is known about the maps
export const isVectorMapCreateAllowed = () => {
    const userRole = SettingsProvider.getUserRole();

    return userRole === ADMIN_ROLE || userRole === EDITOR_ROLE;
};

// => Called on the layer itself
export const isVectorMapEditAllowed = (layer) => {
    const isRemoteLayer = isDefined(layer.getMetadata(METADATA.vectorMapId));

    // local layers can always be edited
    if (!isRemoteLayer) {
        return true;
    }

    const layerRole = layer.getMetadata(METADATA.userRole);
    const userRole = SettingsProvider.getUserRole();

    // Admins can edit everything
    if (userRole === ADMIN_ROLE) {
        return true;
    }

    // Editors can edit maps if they are editors or owners
    if (userRole === EDITOR_ROLE) {
        return layerRole === EDITOR_ROLE_MAP || layerRole === OWNER_ROLE;
    }

    return false;
};

// Called on the draw mode representations

/**
 *
 * @param {{type: "local" | "remote", layerRole: string, id: string | null}} repr
 * @returns {boolean}
 */
export const isVectorMapMetadataEditAllowed = (repr) => {
    if (repr === null) return true;

    const { type, layerRole, id } = repr;
    const isLocalLayer = type === VECTOR_MAP_TYPES.LOCAL;

    // local layers can always be edited
    if (isLocalLayer) {
        return true;
    }

    const userRole = SettingsProvider.getUserRole();

    // Admins can edit everything
    if (userRole === ADMIN_ROLE) {
        return true;
    }

    // Editors can edit map metadata if they are owners
    // or if this is a new map and they will be owners at some point
    if (userRole === EDITOR_ROLE) {
        return layerRole === OWNER_ROLE || !isDefined(id);
    }

    return false;
};

/**
 *
 * @param {{type: "local" | "remote", layerRole: string, id: string | null}} repr
 * @returns {boolean}
 */
export const isVectorMapHistoryViewAllowed = (repr) => {
    if (repr === null) return true;

    const { layerRole, id } = repr;
    const userRole = SettingsProvider.getUserRole();

    // Admins can view everything
    if (userRole === ADMIN_ROLE) {
        return true;
    }

    // Editors can view history if they are owners or editors
    // but the map needs to be already known to the server
    if (userRole === EDITOR_ROLE) {
        return (
            (layerRole === EDITOR_ROLE_MAP || layerRole === OWNER_ROLE) &&
            isDefined(id)
        );
    }

    return false;
};

/**
 * @returns {boolean}
 */
export const isVectorMapRolesOwnerEditAllowed = (repr) => {
    if (repr === null) return true;

    const { id } = repr;
    const userRole = SettingsProvider.getUserRole();

    // Admins can edit if the map is known to the server
    if (userRole === ADMIN_ROLE && isDefined(id)) {
        return true;
    }

    // Everyone else cannot
    return false;
};

/**
 *
 * @param {{type: "local" | "remote", layerRole: string, id: string | null}} repr
 * @returns {boolean}
 */
export const isVectorMapRolesEditorEditAllowed = (repr) => {
    if (repr === null) return true;

    const { layerRole, id } = repr;
    const userRole = SettingsProvider.getUserRole();

    // Admins can edit if the map is known to the server
    if (userRole === ADMIN_ROLE && isDefined(id)) {
        return true;
    }

    // Editors can edit if they are owners
    // but the map needs to be already known to the server
    if (userRole === EDITOR_ROLE) {
        return layerRole === OWNER_ROLE && isDefined(id);
    }

    return false;
};
