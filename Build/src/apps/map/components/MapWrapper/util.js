import { LAYER_TYPES } from "../CustomLayers/LayerTypes.js";

//@TODO: Fix this function for new api
/**
 * Create a single sheet preview layer used in the mosaic map application part
 * @param feature
 * @returns {Promise<vk2.layer.HistoricMap>}
 */
export const createSingleSheetPreviewForFeature = async function (feature) {
    // const newLayer = await createHistoricMapForFeature(feature);
    // newLayer.allowUseInLayerManagement = true;
    // newLayer.set("type", LAYER_TYPES.PREVIEW);
    // newLayer.set("layer_type", LAYER_TYPES.PREVIEW);
    // return newLayer;
    throw new TypeError("Not implemented");
};

export const getControlFeedbackContainer = (
    map,
    opt_selector = "control-feedback-container"
) => {
    let targetEl = document.getElementById(opt_selector);

    // creat target element
    if (targetEl === null) {
        const viewport = map.getCanvasContainer();

        targetEl = document.createElement("div");
        targetEl.id = opt_selector;

        viewport.appendChild(targetEl);
    }

    return targetEl;
};
