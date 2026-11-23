/*
 * Created by tom.schulze@pikobytes.de on 16.11.26.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { getYear, isSameYear } from "date-fns";
import { isDefined, translate } from "@util/util";

/**
 * Default formatter for a closed time period: the year, or e.g. "1900 – 1910" if the
 * period spans several years.
 * @param {string} start - Start date (`YYYY-MM-DD`).
 * @param {string} end - End date (`YYYY-MM-DD`).
 * @returns {string|number}
 * @private
 */
const _formatClosedPeriod = (start, end) => {
    return isSameYear(start, end)
        ? getYear(start)
        : `${getYear(start)} – ${getYear(end)}`;
};

/**
 * Formats a time period for display. One side of the period may be open (`null`):
 * an open end is shown as e.g. "ab 1900", an open start as e.g. "bis 1900". Returns an
 * empty string if both dates are missing.
 * @param {string|null} start - Start date (`YYYY-MM-DD`) or `null` for an open start.
 * @param {string|null} end - End date (`YYYY-MM-DD`) or `null` for an open end.
 * @param {Object} [options] - Formatting options.
 * @param {function(string, string): (string|number)} [options.formatClosedPeriod] - Formats a period with both dates set. Defaults to the year or a year range.
 * @returns {string|number}
 */
export function formatTimePeriod(
    start,
    end,
    { formatClosedPeriod = _formatClosedPeriod } = {}
) {
    // e.g. placeholder layers while loading
    if (!isDefined(start) && !isDefined(end)) {
        return "";
    }

    if (!isDefined(start)) {
        return translate("time-period-open-start").replace(
            "{year}",
            getYear(end)
        );
    }

    if (!isDefined(end)) {
        return translate("time-period-open-end").replace(
            "{year}",
            getYear(start)
        );
    }

    return formatClosedPeriod(start, end);
}
