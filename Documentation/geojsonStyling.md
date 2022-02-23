# Geojson Layer Format

The internally used geojson format is very similar to the format used by [geojson.io]().

This will be explained in the next paragraphs using some example geometries, where individual features are mapped
according to the geojson standard. Instead of explaining the standard, we refer to the
page [geojson.org](https://geojson.org/)
or to the [RFC 7946](https://tools.ietf.org/html/rfc7946). Instead, it is mainly explained how the application makes use
of special styling properties stored under the `properties` keyword.

ℹ In the following a color description shall mean a rgb color representation of the form `"rgb(r,g,b)"` or `"#rrggbb"`.

## Polygon

```JSON
{
    "type": "Feature",
    "geometry": {
        "type": "Polygon",
        "coordinates": [
            [
                [
                    1227105.7201474162,
                    6751742.424857966
                ],
                [
                    1227521.3464887168,
                    6751742.424857966
                ],
                [
                    1227521.3464887168,
                    6752074.448199582
                ],
                [
                    1227105.7201474162,
                    6752074.448199582
                ],
                [
                    1227105.7201474162,
                    6751742.424857966
                ]
            ]
        ]
    },
    "properties": {
        "fill": "#0000FF",
        "fill-opacity": 0.13,
        "stroke": "#0000FF",
        "stroke-opacity": 1,
        "stroke-width": 3
    }
}
```

For polygons, on the one hand the fill color and the alpha channel of the fill color, on the other hand the stroke
color, the corresponding alpha channel and the width of the border can be influenced. The keywords "fill", "
fill-opacity", "stroke", "stroke-opacity" and "stroke-width" are reserved for this purpose.

### Properties

- fill: color
- fill-opacity: [0,1]
- stroke: color
- stroke-opacity: [0,1]
- stroke-width: [0,20] - stroke width in pixels

## Linestring

```JSON
{
    "type": "Feature",
    "geometry": {
        "type": "LineString",
        "coordinates": [
            [
                1227604.9494884037,
                6754264.249627092
            ],
            [
                1227681.3865166889,
                6754068.976906391
            ]
        ]
    },
    "properties": {
        "stroke": "#555555",
        "stroke-opacity": 1,
        "stroke-width": 5
    }
}
```

LineStrings mostly behave like polygons, but do not have a surface, therefore only the stroke properties apply.

### Properties

- stroke: color
- stroke-opacity: [0,1]
- stroke-width: [0,20] - stroke width in pixels

## Points

```JSON
{
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [
            1227604.9494884037,
            6754267.2354485085
        ]
    },
    "properties": {
        "marker": "blue"
    }
}
```

Points are represented as markers in the application. Because an image file must be provided for each marker, there is
so far a fixed selection of available markers.

Currently, it is intended that these are referenced via the name of the image file without the file extension. These
names currently correspond to the colors of the markers.

All available marker files can be found at `Resources/Public/Images/markers`.

### Properties

- marker: [ "blue", "green", "orange", "pink", "yellow" ]

## Complete Example Geojson File

```JSON
{
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    1227604.9494884037,
                    6754267.2354485085
                ]
            },
            "properties": {
                "marker": "blue"
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            1227105.7201474162,
                            6751742.424857966
                        ],
                        [
                            1227521.3464887168,
                            6751742.424857966
                        ],
                        [
                            1227521.3464887168,
                            6752074.448199582
                        ],
                        [
                            1227105.7201474162,
                            6752074.448199582
                        ],
                        [
                            1227105.7201474162,
                            6751742.424857966
                        ]
                    ]
                ]
            },
            "properties": {
                "fill": "#0000FF",
                "fill-opacity": 0.13,
                "stroke": "#0000FF",
                "stroke-opacity": 1,
                "stroke-width": 3
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [
                        1227604.9494884037,
                        6754264.249627092
                    ],
                    [
                        1227681.3865166889,
                        6754068.976906391
                    ]
                ]
            },
            "properties": {
                "stroke": "#555555",
                "stroke-opacity": 1,
                "stroke-width": 5
            }
        }
    ]
}
```
