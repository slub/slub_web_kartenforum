/**
 * Created by nicolas.looschen@pikobytes.de on 16.09.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

let settingsObject = {};

export default {
    getSettings() {
        return settingsObject;
    },
    updateSettings(newSettings) {
        settingsObject = newSettings;
    },
};
