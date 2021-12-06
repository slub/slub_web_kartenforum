/**
 * Created by nicolas.looschen@pikobytes.de on 26/11/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

export const checkIfArrayContainsFeature = (array, feature) => {
    return (
        array.findIndex(
            ({ feature: selFeature }) => selFeature.get("id") === feature.get("id")
        ) !== -1
    );
};


