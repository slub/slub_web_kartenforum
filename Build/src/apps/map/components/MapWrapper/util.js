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
