/**
 * Created by nicolas.looschen@pikobytes.de on 04.12.2024.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import { atom, useRecoilCallback, useSetRecoilState } from "recoil";
import { initialGeoJsonDrawState, mapState } from "@map/atoms";
import { isDefined } from "@util/util";
import { useCallback } from "react";
import { FEATURE_PROPERTIES } from "../../constants";

const trackingHandlerState = atom({
    key: "trackingHandlerState",
    default: null,
});

export const geoJsonChangeTrackingState = atom({
    key: "geoJsonChangeTrackingState",
    default: null,
});

export const useTrackGeoJsonChanges = () => {
    const setGeoJsonChangeTrackingState = useSetRecoilState(
        geoJsonChangeTrackingState
    );

    const handleDeleteFeature = useCallback((deleteFeatureId) => {
        setGeoJsonChangeTrackingState((old) => {
            const wasAdded = old.addIds.includes(deleteFeatureId);
            if (wasAdded) {
                return {
                    ...old,
                    addIds: old.addIds.filter((id) => id !== deleteFeatureId),
                };
            } else {
                const newDirtyMap = new Map(old.dirtyMap);
                newDirtyMap.delete(deleteFeatureId);

                return {
                    ...old,
                    dirtyMap: newDirtyMap,
                    deleteIds: [...old.deleteIds, deleteFeatureId],
                };
            }
        });
    }, []);

    const handleUpdateFeature = useRecoilCallback(
        ({ snapshot, set }) =>
            async (updatedFeature) => {
                const geoJson = await snapshot.getPromise(
                    initialGeoJsonDrawState
                );

                const oldFeature = geoJson.features.find(
                    (f) => f.id === updatedFeature.id
                );

                if (oldFeature === undefined) {
                    return;
                }

                // Check if properties have changed
                if (
                    Object.keys(oldFeature.properties).length !==
                        Object.keys(updatedFeature.properties).length ||
                    Object.keys(oldFeature.properties).some((key) => {
                        const oldValue = oldFeature.properties[key];
                        const updValue = updatedFeature.properties[key];

                        if (key === FEATURE_PROPERTIES.time) {
                            return (
                                oldValue[0] !== updValue[0] ||
                                oldValue[1] !== updValue[1]
                            );
                        }
                        return oldValue !== updValue;
                    })
                ) {
                    set(geoJsonChangeTrackingState, (old) => {
                        const newDirtyMap = new Map(old.dirtyMap);
                        newDirtyMap.set(updatedFeature.id, true);
                        return {
                            ...old,
                            dirtyMap: newDirtyMap,
                        };
                    });
                } else {
                    set(geoJsonChangeTrackingState, (old) => {
                        if (
                            old.dirtyMap.has(updatedFeature.id) &&
                            old.dirtyMap.get(updatedFeature.id)
                        ) {
                            const newDirtyMap = new Map(old.dirtyMap);
                            newDirtyMap.set(updatedFeature.id, false);
                            return {
                                ...old,
                                dirtyMap: newDirtyMap,
                            };
                        }
                        return old;
                    });
                }
            },
        []
    );

    const registerMapEventHandler = useRecoilCallback(
        ({ snapshot, set }) =>
            async () => {
                // Register handlers
                const map = await snapshot.getPromise(mapState);

                if (isDefined(map)) {
                    const handler = {
                        "draw.update": (e) => {
                            const feature = e.features[0];
                            set(geoJsonChangeTrackingState, (old) => {
                                if (
                                    old.dirtyMap.has(feature.id) &&
                                    !old.dirtyMap.get(feature.id)
                                ) {
                                    const newDirtyMap = new Map(old.dirtyMap);
                                    newDirtyMap.set(feature.id, true);
                                    return {
                                        ...old,
                                        dirtyMap: newDirtyMap,
                                    };
                                }

                                return old;
                            });
                        },
                        "draw.create": (e) => {
                            set(geoJsonChangeTrackingState, (old) => {
                                return {
                                    ...old,
                                    addIds: [...old.addIds, e.features[0].id],
                                };
                            });
                        },
                        "draw.delete": (e) => {
                            set(geoJsonChangeTrackingState, (old) => {
                                const wasAdded = old.addIds.includes(
                                    e.features[0].id
                                );
                                if (wasAdded) {
                                    return {
                                        ...old,
                                        addIds: old.addIds.filter(
                                            (id) => id !== e.features[0].id
                                        ),
                                    };
                                } else {
                                    const newDirtyMap = new Map(old.dirtyMap);
                                    newDirtyMap.delete(e.features[0].id);

                                    return {
                                        ...old,
                                        dirtyMap: newDirtyMap,
                                        deleteIds: [
                                            ...old.deleteIds,
                                            e.features[0].id,
                                        ],
                                    };
                                }
                            });
                        },
                    };

                    Object.keys(handler).forEach((key) => {
                        map.on(key, handler[key]);
                    });

                    set(trackingHandlerState, handler);
                }

                // Initialize tracking state
                const geoJson = await snapshot.getPromise(
                    initialGeoJsonDrawState
                );
                const dirtyMap = new Map();
                geoJson.features.forEach((feature) => {
                    dirtyMap.set(feature.id, false);
                });

                set(geoJsonChangeTrackingState, {
                    dirtyMap,
                    deleteIds: [],
                    addIds: [],
                });
            },
        []
    );

    const unregisterMapEventHandler = useRecoilCallback(
        ({ snapshot, set }) =>
            async () => {
                const map = await snapshot.getPromise(mapState);
                if (isDefined(map)) {
                    const handlers = await snapshot.getPromise(
                        trackingHandlerState
                    );

                    if (handlers !== null) {
                        Object.keys(handlers).forEach((key) => {
                            map.off(key, handlers[key]);
                        });
                        set(trackingHandlerState, null);
                    }
                }
            },
        []
    );

    return {
        handleDeleteFeature,
        handleUpdateFeature,
        registerMapEventHandler,
        unregisterMapEventHandler,
    };
};
