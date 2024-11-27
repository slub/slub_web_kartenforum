/**
 * Created by nicolas.looschen@pikobytes.de on 25.01.22
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

export const parseGeoJsonFile = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = function () {
            try {
                resolve({
                    content: JSON.parse(this.result),
                    modified: file.lastModified,
                    name: file.name.split(".")[0],
                });
            } catch (e) {
                console.log(e);
                reject();
            }
        };

        reader.readAsText(file);
    });
