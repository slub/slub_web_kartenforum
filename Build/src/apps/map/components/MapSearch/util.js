/**
 * Created by nicolas.looschen@pikobytes.de on 26/11/21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

export const checkIfArrayContainsLayer = (array, layer) => {
    return (
        array.findIndex(
            (selectedLayer) => selectedLayer.getId() === layer.getId()
        ) !== -1
    );
};
