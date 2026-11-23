import { getCurrentYear } from "@util/date";

const YEAR_MIN = 1;

const isEmpty = (value) =>
    value === undefined || value === null || value === "";

// An empty year is valid, otherwise it must be a whole number from YEAR_MIN to the current year
const validateYear = (value) => {
    if (isEmpty(value)) {
        return true;
    }

    const year = Number(value);
    if (!Number.isInteger(year) || year < YEAR_MIN) {
        return "Please enter a valid year";
    }

    return year <= getCurrentYear() || "The year must not be in the future";
};

// The time period may be open on one side, but not on both
const validateTimePeriodSet = (value, otherValue) =>
    !isEmpty(value) ||
    !isEmpty(otherValue) ||
    "Please enter a start or end year";

export const formValidations = {
    description: {
        name: "description",
        label: "description",
        multiline: true,
        id: "description",
        validation: {
            required: {
                value: false,
                message: "required",
            },
        },
    },
    map_type: {
        name: "map_type",
        label: "map_type",
        id: "map_type",
        validation: {
            required: {
                value: true,
                message: "required",
            },
        },
        options: [
            { label: "Äquidistantenkarte", value: "ae" },
            { label: "Andere Karten", value: "ak" },
            { label: "Stadtpläne", value: "cm" },
            { label: "Geologische Karten", value: "gl" },
            { label: "Meilenblätter", value: "mb" },
            { label: "Messtischblätter", value: "mtb" },
            {
                label: "Topographische Karte des Deutschen Reiches",
                value: "tk",
            },
            { label: "Topographische Karten", value: "tkx" },
        ],
    },
    license: {
        name: "license",
        label: "license",
        type: "text",
        id: "license",
        validation: {
            required: {
                value: true,
                message: "required",
            },
        },
    },
    map_scale: {
        name: "map_scale",
        label: "map_scale",
        type: "number",
        id: "map_scale",
        validation: {
            required: {
                value: true,
                message: "required",
            },
        },
    },
    measures: {
        name: "measures",
        label: "measures",
        type: "text",
        id: "measures",
        validation: {
            required: {
                value: false,
                message: "required",
            },
        },
    },
    owner: {
        name: "owner",
        label: "owner",
        type: "text",
        id: "owner",
        validation: {
            required: {
                value: false,
                message: "required",
            },
        },
    },
    permalink: {
        name: "permalink",
        label: "permalink",
        type: "text",
        id: "permalink",
        validation: {
            required: {
                value: false,
                message: "required",
            },
        },
    },
    ppn: {
        name: "ppn",
        label: "ppn",
        type: "text",
        id: "ppn",
        validation: {
            required: {
                value: false,
                message: "required",
            },
        },
    },
    technic: {
        name: "technic",
        label: "technic",
        type: "text",
        id: "technic",
        validation: {
            required: {
                value: false,
                message: "required",
            },
        },
    },
    time_period_start: {
        name: "time_period_start",
        label: "time_period_start",
        type: "number",
        id: "time_period_start",
        validation: {
            required: {
                value: false,
                message: "required",
            },
            validate: {
                isYear: validateYear,
                isTimePeriodSet: (value, values) =>
                    validateTimePeriodSet(value, values.time_period_end),
            },
            deps: ["time_period_end"],
        },
    },
    time_period_end: {
        name: "time_period_end",
        label: "time_period_end",
        type: "number",
        id: "time_period_end",
        validation: {
            required: {
                value: false,
                message: "required",
            },
            validate: {
                isYear: validateYear,
                isTimePeriodSet: (value, values) =>
                    validateTimePeriodSet(value, values.time_period_start),
                isNotBeforeStart: (value, values) =>
                    isEmpty(value) ||
                    isEmpty(values.time_period_start) ||
                    Number(values.time_period_start) <= Number(value) ||
                    "The end year must not be before the start year",
            },
            deps: ["time_period_start"],
        },
    },
    allow_download: {
        name: "allow_download",
        label: "allow_download",
        id: "allow_download",
        validation: {
            required: {
                value: false,
                message: "required",
            },
        },
        options: [
            { label: "true", value: true },
            { label: "false", value: false },
        ],
    },
    title: {
        name: "title",
        label: "title",
        type: "text",
        id: "title",
        validation: {
            required: {
                value: true,
                message: "required",
            },
        },
    },
    title_serie: {
        name: "title_serie",
        label: "title_serie",
        type: "text",
        id: "title_serie",
        validation: {
            required: {
                value: false,
                message: "required",
            },
        },
    },
    title_short: {
        name: "title_short",
        label: "title_short",
        type: "text",
        id: "title_short",
        validation: {
            required: {
                value: true,
                message: "required",
            },
        },
    },
    type: {
        name: "type",
        label: "type",
        type: "text",
        id: "type",
        validation: {
            required: {
                value: false,
                message: "required",
            },
        },
    },
};
