/*
 * Created by tom.schulze@pikobytes.de on 12.02.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */
import {
    serializeBasemapId,
    serializeViewMode,
    cameraToUrlParams,
    serializeSelectedLayers,
    serializeFeatureIdentifier,
} from "@map/persistence/urlSerializer.js";
import { stringify } from "query-string";
import {
    serializeCameraOptions,
    getUrlWithQuery,
} from "@map/persistence/util.js";
import { isDefined } from "@util/util.js";
import { useRecoilCallback } from "recoil";
import {
    activeBasemapIdState,
    mapState,
    selectedGeoJsonFeatureIdentifierState,
    selectedLayersState,
} from "@map/atoms";

const useGenerateFeaturePermalink = () =>
    useRecoilCallback(
        ({ snapshot }) =>
            async () => {
                const map = await snapshot.getPromise(mapState);
                const selectedGeoJsonFeatureIdentifier =
                    await snapshot.getPromise(
                        selectedGeoJsonFeatureIdentifierState
                    );

                if (
                    !isDefined(map) ||
                    !isDefined(selectedGeoJsonFeatureIdentifier)
                )
                    return;

                const selectedLayers = await snapshot.getPromise(
                    selectedLayersState
                );
                const activeBasemapId = await snapshot.getPromise(
                    activeBasemapIdState
                );

                const viewModeParam = serializeViewMode(
                    map.isVkfGlobeModeEnabled()
                );
                const selectedLayerParam =
                    serializeSelectedLayers(selectedLayers);
                const basemapParam = serializeBasemapId(activeBasemapId);
                const cameraParams = cameraToUrlParams(
                    serializeCameraOptions(map, true)
                );
                const featureParam = serializeFeatureIdentifier(
                    selectedGeoJsonFeatureIdentifier
                );

                const queryString = stringify(
                    Object.assign(
                        {},
                        cameraParams,
                        viewModeParam,
                        selectedLayerParam,
                        featureParam,
                        basemapParam
                    ),
                    { arrayFormat: "comma" }
                );

                return Promise.resolve(getUrlWithQuery(queryString));
            },
        []
    );

export default useGenerateFeaturePermalink;
