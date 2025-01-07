/*
 * Created by tom.schulze@pikobytes.de on 06.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

/**
 * Calculates the new x positions for the min/max time slider labels.
 *
 * @param {[number, number]} newValues The min and max values to calculate the positions from.
 * @param {[number, number]} timeRange The min and max extent of the time slider.
 * @param {number} labelWidth The width of the label in pixels (assumed to be identical for min/max).
 * @param {number} sliderWidth The width of the slider in pixels.
 * @returns {{posMin: number, posMax: number}}
 */
export const calculateLabelPositions = (
    newValues,
    timeRange,
    labelWidth,
    sliderWidth
) => {
    const factors = newValues.map(
        (value) => (value - timeRange[0]) / (timeRange[1] - timeRange[0])
    );

    const posMin = factors[0] * sliderWidth;
    const posMax = factors[1] * sliderWidth;

    const renderedPosMin = calculatePosition(posMin, labelWidth, sliderWidth);
    const renderedPosMax = calculatePosition(posMax, labelWidth, sliderWidth);

    return { posMin: renderedPosMin, posMax: renderedPosMax };
};

/**
 * Calculates the new x positions for the collision label of the slider. It is shown when the two
 * regular labels will overlap.
 *
 * @param {[number, number]} newValues The min and max values to calculate the positions from.
 * @param {[number, number]} timeRange The min and max extent of the time slider.
 * @param {number} labelWidth The width of the label in pixels (assumed to be identical for min/max).
 * @param {number} sliderWidth The width of the slider in pixels.
 * @returns {{posMin: number, posMax: number}}
 */
export const calculateCollisionLabelPosition = (
    newValues,
    timeRange,
    labelWidth,
    sliderWidth
) => {
    const center = (newValues[1] - newValues[0]) / 2 + newValues[0];
    const factor = (center - timeRange[0]) / (timeRange[1] - timeRange[0]);

    const posX = factor * sliderWidth;

    return calculatePosition(posX, labelWidth, sliderWidth);
};

const calculatePosition = (posX, labelWidth, sliderWidth) => {
    if (posX < labelWidth / 2) {
        // snap left
        return 0;
    }

    if (posX > sliderWidth - labelWidth / 2) {
        // snap right
        return sliderWidth - labelWidth;
    }

    // move
    return posX - labelWidth / 2;
};
