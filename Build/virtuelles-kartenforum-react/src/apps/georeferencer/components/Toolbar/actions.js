/**
 * Created by jacob.mendt@pikobytes.de on 18.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import round from "lodash.round";
import Draw from "ol/src/interaction/Draw";
import Modify from "ol/src/interaction/Modify";
import Select from "ol/src/interaction/Select";
import Polygon from "ol/src/geom/Polygon";
import { shiftKeyOnly, singleClick } from "ol/events/condition";
import { createGcpDefaultStyle, createGcpHoverStyle } from "../../util/styles";

/**
 * Actives the zoom pan action. Returns a function which disables action
 * @param {ol.Map} srcMap
 * @param {ol.Map} trgMap
 * @param {Function|undefined} disableFn
 * @returns {{
 *     disable: Function()
 * }}
 */
export function activateZoomPanAction(srcMap, trgMap, disableFn) {
    if (disableFn !== undefined) {
        disableFn();
    }

    // Set the default cursor
    srcMap.getTargetElement().style.cursor = "grab";
    trgMap.getTargetElement().style.cursor = "grab";

    // Change cursor on moving
    const onMoveStart = (e) => {
        e.target.getTargetElement().style.cursor = "grabbing";
    };
    const onMoveEnd = (e) => {
        e.target.getTargetElement().style.cursor = "grab";
    };

    srcMap.on("movestart", onMoveStart);
    srcMap.on("moveend", onMoveEnd);
    trgMap.on("movestart", onMoveStart);
    trgMap.on("moveend", onMoveEnd);

    return {
        disable: () => {
            srcMap.un("movestart", onMoveStart);
            srcMap.un("moveend", onMoveEnd);
            trgMap.un("movestart", onMoveStart);
            trgMap.un("moveend", onMoveEnd);
        },
    };
}

/**
 * Actives add gcp action. Returns a function which disables the action
 * @param {ol.Map} srcMap
 * @param {ol.Map} trgMap
 * @param {ol.source.Vector} srcVecSou
 * @param {ol.source.Vector} trgVecSou
 * @param {ol.source.Vector} editSrcVecSou
 * @param {ol.source.Vector} editTrgVecSou
 * @param {Function} onSetHelperMsg
 * @param {Function|undefined} disableFn
 * @returns {{
 *     disable: Function()
 * }}
 */
export function activateAddGcpAction(
    srcMap,
    trgMap,
    srcVecSou,
    trgVecSou,
    editSrcVecSou,
    editTrgVecSou,
    onSetHelperMsg,
    disableFn
) {
    const actionId = "activateAddGcpAction";

    if (disableFn !== undefined) {
        disableFn();
    }

    // Define helper message
    const helperMsg = {
        START: "Erzeugen Sie einen Passpunkt und setzen Sie dafür einen Punkt in der originalen Ansicht oder der georeferenzierten Ansicht.",
        SET_SRC:
            "Setzen Sie jetzt einen weiteren Punkt in der originalen Ansicht und schließen Sie den Prozess der Erstellung eines Passpunktes ab.",
        SET_TRG:
            "Setzen Sie jetzt einen weiteren Punkt in der georeferenzierten Ansicht und schließen Sie den Prozess der Erstellung eines Passpunktes ab.",
    };

    // Set the default cursor
    srcMap.getTargetElement().style.cursor = "default";
    trgMap.getTargetElement().style.cursor = "default";

    // Add draw interactions to the map
    const srcInteractionDraw = new Draw({
        source: editSrcVecSou,
        type: "Point",
        style: createGcpDefaultStyle,
    });
    const trgInteractionDraw = new Draw({
        source: editTrgVecSou,
        type: "Point",
        style: createGcpDefaultStyle,
    });

    // Add the interactions to the map
    srcMap.addInteraction(srcInteractionDraw);
    trgMap.addInteraction(trgInteractionDraw);

    //
    // Add handler
    //
    editSrcVecSou.georeference_id = "src";
    editTrgVecSou.georeference_id = "trg";

    // Finishs a gcp adding process
    const finishAdding = () => {
        // Copy features from edit to pure src
        const gcpId = srcVecSou.getFeatures().length + 1;
        const srcFeature = editSrcVecSou.getFeatures()[0];
        srcFeature.setStyle(createGcpDefaultStyle(`${gcpId}`));
        srcFeature.setId(gcpId);
        srcVecSou.addFeature(srcFeature);
        const trgFeature = editTrgVecSou.getFeatures()[0];
        trgFeature.setStyle(createGcpDefaultStyle(`${gcpId}`));
        trgFeature.setId(gcpId);
        trgVecSou.addFeature(trgFeature);

        // Clear the edits
        editSrcVecSou.clear();
        editTrgVecSou.clear();
    };

    // Make sure that a user can not create a point on one of the views twice, while trying to create
    // a gcp.
    const onAddFeature = (e) => {
        const vecSrc = e.target;
        const feature = e.feature;

        // If isFinish is true, a adding process for a new gcp should be finished
        const isFinish =
            (vecSrc.georeference_id === "src" &&
                editTrgVecSou.getFeatures().length === 1) ||
            (vecSrc.georeference_id === "trg" &&
                editSrcVecSou.getFeatures().length === 1);
        if (isFinish) {
            setTimeout(finishAdding, 100);
        }

        // If isForbidden the user adds a feature in a forbidden order and this should be prevented
        const isForbidden = vecSrc.getFeatures().length > 1;
        if (isForbidden) {
            vecSrc.removeFeature(feature);
        }

        // Update the message
        if (vecSrc.georeference_id === "src") {
            onSetHelperMsg(helperMsg.SET_TRG, actionId);
        } else {
            onSetHelperMsg(helperMsg.SET_SRC, actionId);
        }

        // Update the style
        feature.setStyle(createGcpHoverStyle());
    };

    editSrcVecSou.on("addfeature", onAddFeature);
    editTrgVecSou.on("addfeature", onAddFeature);

    // Set initial helper msg
    onSetHelperMsg(helperMsg.START, actionId);

    return {
        disable: () => {
            // Reset helper msg
            onSetHelperMsg(null, actionId);

            // Clear pending edits
            editSrcVecSou.clear();
            editTrgVecSou.clear();

            // Remove interaction
            srcMap.removeInteraction(srcInteractionDraw);
            trgMap.removeInteraction(trgInteractionDraw);

            // Remove listeners
            editSrcVecSou.un("addfeature", onAddFeature);
            editTrgVecSou.un("addfeature", onAddFeature);
        },
    };
}

/**
 * Actives move gcp action. Returns a function which disables the action
 * @param {ol.Map} srcMap
 * @param {ol.Map} trgMap
 * @param {ol.source.Vector} srcVecSou
 * @param {ol.source.Vector} trgVecSou
 * @param {Function} onSetHelperMsg
 * @param {Function|undefined} disableFn
 * @returns {{
 *     disable: Function()
 * }}
 */
export function activateMoveGcpAction(
    srcMap,
    trgMap,
    srcVecSou,
    trgVecSou,
    onSetHelperMsg,
    disableFn
) {
    const actionId = "activateMoveGcpAction";

    if (disableFn !== undefined) {
        disableFn();
    }

    // Define helper message
    const helperMsg = {
        START: "Klicken Sie auf Passpunkt und verschieben Sie diesen mittels Drag&Drop.",
    };

    // Set the default cursor
    srcMap.getTargetElement().style.cursor = "grab";
    trgMap.getTargetElement().style.cursor = "grab";

    // Add draw interactions to the map
    const srcInteractionModify = new Modify({
        source: srcVecSou,
        pixelTolerance: 10,
        style: createGcpHoverStyle,
    });
    const trgInteractionModify = new Modify({
        source: trgVecSou,
        pixelTolerance: 10,
        style: createGcpHoverStyle,
    });

    // Add the interactions to the map
    srcMap.addInteraction(srcInteractionModify);
    trgMap.addInteraction(trgInteractionModify);

    // Update cursor on modify start
    const onModifyStart = (e) => {
        e.target.getMap().getTargetElement().style.cursor = "grabbing";
    };
    const onModifyEnd = (e) => {
        e.target.getMap().getTargetElement().style.cursor = "grab";
    };

    srcInteractionModify.on("modifystart", onModifyStart);
    srcInteractionModify.on("modifyend", onModifyEnd);
    trgInteractionModify.on("modifystart", onModifyStart);
    trgInteractionModify.on("modifyend", onModifyEnd);

    // Set initial helper msg
    onSetHelperMsg(helperMsg.START, actionId);

    return {
        disable: () => {
            // Reset helper msg
            onSetHelperMsg(null, actionId);

            // Remove event handler
            srcInteractionModify.un("modifystart", onModifyStart);
            srcInteractionModify.un("modifyend", onModifyEnd);
            trgInteractionModify.un("modifystart", onModifyStart);
            trgInteractionModify.un("modifyend", onModifyEnd);

            // Remove interaction
            srcMap.removeInteraction(srcInteractionModify);
            trgMap.removeInteraction(trgInteractionModify);
        },
    };
}

/**
 * Actives delete gcp action. Returns a function which disables the action
 * @param {ol.Map} srcMap
 * @param {ol.Map} trgMap
 * @param {ol.source.Vector} srcVecSou
 * @param {ol.source.Vector} trgVecSou
 * @param {ol.layer.Vector} srcVecLay
 * @param {ol.layer.Vector} trgVecLay
 * @param {Function} onSetHelperMsg
 * @param {Function|undefined} disableFn
 * @returns {{
 *     disable: Function()
 * }}
 */
export function activateDelGcpAction(
    srcMap,
    trgMap,
    srcVecSou,
    trgVecSou,
    srcVecLay,
    trgVecLay,
    onSetHelperMsg,
    disableFn
) {
    const actionId = "activateDelGcpAction";

    if (disableFn !== undefined) {
        disableFn();
    }

    // Define helper message
    const helperMsg = {
        START: "Klicken Sie auf Passpunkt um diesen zu löschen.",
    };

    // Set the default cursor
    srcMap.getTargetElement().style.cursor = "default";
    trgMap.getTargetElement().style.cursor = "default";

    // Remove handler
    const deleteFeature = (feature) => {
        const srcFt = srcVecSou.getFeatureById(feature.getId());
        const trgFt = trgVecSou.getFeatureById(feature.getId());

        if (srcFt !== null && trgFt !== null) {
            srcVecSou.removeFeature(srcFt);
            trgVecSou.removeFeature(trgFt);
        }
    };

    // Add delete interactions to the map
    const srcInteractionDel = new Select({
        layer: srcVecLay,
        hitTolerance: 5,
        condition: (e) => {
            if (e.type === "click") {
                e.map.forEachFeatureAtPixel(e.pixel, deleteFeature);
            }
        },
    });
    const trgInteractionDel = new Select({
        layer: trgVecLay,
        hitTolerance: 5,
        condition: (e) => {
            if (e.type === "click") {
                e.map.forEachFeatureAtPixel(e.pixel, deleteFeature);
            }
        },
    });

    // Add the interactions to the map
    srcMap.addInteraction(srcInteractionDel);
    trgMap.addInteraction(trgInteractionDel);

    // Set initial helper msg
    onSetHelperMsg(helperMsg.START, actionId);

    return {
        disable: () => {
            // Reset helper msg
            onSetHelperMsg(null, actionId);

            // Remove interaction
            srcMap.removeInteraction(srcInteractionDel);
            trgMap.removeInteraction(trgInteractionDel);
        },
    };
}

/**
 * Actives draw clip action. Returns a function which disables the action
 * @param {ol.Map} trgMap
 * @param {ol.source.Vector} trgVecSou
 * @param {Function} onSetHelperMsg
 * @param {Function|undefined} disableFn
 * @returns {{
 *     disable: Function()
 * }}
 */
export function activateDrawClipAction(
    trgMap,
    trgVecSou,
    onSetHelperMsg,
    disableFn
) {
    const actionId = "activateDrawClipAction";

    if (disableFn !== undefined) {
        disableFn();
    }

    // Define helper message
    const helperMsg = {
        START: "Klicken Sie auf einen Punkt der georeferenzierten Karte und fangen Sie an das Clip-Polygon zu zeichnen oder zu editieren.",
    };

    // Set the default cursor
    trgMap.getTargetElement().style.cursor = "default";

    // The parameter is needed to connect the geometryFunction of the draw interaction and the condition function.
    // Basically the case where the point[i] is the same like point[i - 1] should be prevented. Further the hole
    // condition setup is used for preventing the drawing of triangles.
    let lastPointCoordinate;

    // Add delete interactions to the map
    const interactionDraw = new Draw({
        features: trgVecSou.getFeaturesCollection(),
        type: "Polygon",
        minPoints: 5,
        condition: (e) => {
            const coordinate = e.coordinate;
            return (
                !(
                    lastPointCoordinate !== undefined &&
                    round(lastPointCoordinate[0], 4) ===
                        round(coordinate[0], 4) &&
                    round(lastPointCoordinate[1], 4) === round(coordinate[1], 4)
                ) && trgVecSou.getFeatures().length === 0
            );
        },
    });
    const interactionModify = new Modify({
        features: trgVecSou.getFeaturesCollection(),
        // the SHIFT key must be pressed to delete vertices, so
        // that new vertices can be drawn at the same position
        // of existing vertices
        deleteCondition: (e) => {
            const coordinate =
                trgVecSou.getFeatures().length >= 1
                    ? trgVecSou
                          .getFeatures()[0]
                          .getGeometry()
                          .getCoordinates()[0]
                    : undefined;
            return (
                coordinate !== undefined &&
                coordinate.length > 5 &&
                shiftKeyOnly(e) &&
                singleClick(event)
            );
        },
    });

    // Make sure to always preventing drawing if already a polygon exists
    interactionDraw.on("drawstart", (e) => {
        if (trgVecSou.getFeatures().length >= 1) {
            this.abortDrawing();
        }
    });

    // Add the interactions to the map
    trgMap.addInteraction(interactionDraw);
    trgMap.addInteraction(interactionModify);

    // Set initial helper msg
    onSetHelperMsg(helperMsg.START, actionId);

    return {
        disable: () => {
            // Reset helper msg
            onSetHelperMsg(null, actionId);

            // Remove interaction
            trgMap.removeInteraction(interactionDraw);
            trgMap.removeInteraction(interactionModify);
        },
    };
}
