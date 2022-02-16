/**
 * Created by jacob.mendt@pikobytes.de on 11.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { atom } from "recoil";

export const helperMessageState = atom({
    key: "helperMessageState",
    default: null,
});

export const isLoadingState = atom({
    key: "isLoadingState",
    default: false,
});

export const mapMetadataState = atom({
    key: "mapMetadataState",
    default: null,
});

export const rectifiedImageParamsState = atom({
    key: "rectifiedImageParamsState",
    default: null,
});

export const sourceViewParamsState = atom({
    key: "sourceViewParamsState",
    default: null,
    dangerouslyAllowMutability: true,
});

export const targetViewParamsState = atom({
    key: "targetViewParamsState",
    default: null,
    dangerouslyAllowMutability: true,
});

export const transformationState = atom({
    key: "transformationState",
    default: null,
});
