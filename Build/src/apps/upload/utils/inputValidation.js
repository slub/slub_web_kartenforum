export const formValidations = {
    description: {
        name: "description",
        label: "description",
        multiline: true,
        id: "description",
        validation: {
            required: {
                value: true,
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
    time_of_publication: {
        name: "time_of_publication",
        label: "time_of_publication",
        type: "number",
        id: "time_of_publication",
        validation: {
            required: {
                value: true,
                message: "required",
            },
            maxLength: {
                value: 4,
                message: "Please enter a valid year",
            },
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
