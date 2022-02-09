/**
 * Created by nicolas.looschen@pikobytes.de on 25.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

export const parseGeoJsonFile = (file, callback, errorCallback) => {
    const reader = new FileReader();
    reader.onloadend = function () {
        try {
            callback({
                content: JSON.parse(this.result),
                modified: file.lastModifiedDate,
                name: file.name.split(".")[0],
            });
        } catch (e) {
            console.log(e);
            errorCallback();
        }
    };

    reader.readAsText(file);
};
